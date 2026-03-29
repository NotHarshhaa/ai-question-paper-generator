import uuid
import logging
from datetime import datetime, timezone

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

from config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG, T5_MODEL_NAME, BERT_MODEL_NAME
from database.db import init_db, save_paper, get_all_papers, get_paper_by_id, delete_paper_by_id, get_pyq_stats_by_subject
from utils.nlp_processor import NLPProcessor
from utils.ai_engine import AIEngine
from utils.smart_selector import SmartSelector
from utils.paper_structurer import PaperStructurer
from utils.pdf_generator import PDFGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# Initialize components
nlp = NLPProcessor()
ai_engine = AIEngine(T5_MODEL_NAME, BERT_MODEL_NAME)
selector = SmartSelector(ai_engine)
structurer = PaperStructurer()
pdf_gen = PDFGenerator()

# Initialize database
init_db()

# Eagerly load AI models at startup so the first HTTP request doesn't
# trigger a multi-minute model download / load that times out the client.
logger.info("Pre-loading AI models at startup (this may take a few minutes on first run)...")
try:
    ai_engine.load_models()
    logger.info("AI models loaded successfully.")
except Exception as _exc:
    logger.warning("Model pre-load encountered an error (fallback will be used): %s", _exc)


@app.route("/api/generate", methods=["POST"])
def generate_paper():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        subject = data.get("subject", "").strip()
        syllabus = data.get("syllabus", "").strip()
        exam_pattern = data.get("exam_pattern", "standard")
        total_marks = int(data.get("total_marks", 80))
        duration_minutes = int(data.get("duration_minutes", 180))
        num_questions = int(data.get("num_questions", 9))
        difficulty_distribution = data.get("difficulty_distribution", {"easy": 30, "medium": 50, "hard": 20})
        university_name = data.get("university_name", "").strip()
        semester = data.get("semester", "").strip()

        if not subject or not syllabus:
            return jsonify({"error": "Subject and syllabus are required"}), 400
        if len(syllabus) < 10:
            return jsonify({"error": "Syllabus must be at least 10 characters"}), 400

        logger.info("Generating paper for subject: %s", subject)

        # Step 1: NLP — Extract topics and units
        topics = nlp.extract_topics(syllabus)
        units = nlp.extract_units(syllabus)
        unit_topic_map = nlp.map_topics_to_units(syllabus)
        important_topics = nlp.get_important_topics(syllabus, top_n=20)

        logger.info("Extracted %d topics, %d units", len(topics), len(units))

        # Step 2: AI — Generate questions using PYQ patterns with fallbacks
        all_questions = []
        questions_per_topic = max(2, (num_questions * 3) // max(len(important_topics), 1))

        for topic in important_topics:
            # Find which unit this topic belongs to
            topic_unit = "Unit 1"
            for unit_name, unit_topics in unit_topic_map.items():
                unit_topics_list: list[str] = [str(t) for t in unit_topics]
                if any(topic.lower() in t.lower() or t.lower() in topic.lower() for t in unit_topics_list):
                    topic_unit = str(unit_name)
                    break

            # Try PYQ pattern generation with timeout protection
            pyq_generated = []
            try:
                pyq_generated = ai_engine.generate_questions_with_pyq_patterns(
                    subject, topic, questions_per_topic
                )
                logger.info("PYQ generation successful for topic: %s", topic)
            except Exception as e:
                logger.warning("PYQ generation failed for %s: %s", topic, e)
                # Fallback to simple template questions
                pyq_generated = ai_engine._generate_fallback_questions_dict(topic, questions_per_topic)

            for q_data in pyq_generated:
                all_questions.append(
                    {
                        "id": str(uuid.uuid4()),
                        "text": q_data["text"],
                        "marks": q_data["marks"],
                        "difficulty": q_data["difficulty"],
                        "unit": topic_unit,
                        "topic": topic,
                        "question_type": q_data.get("question_type") or "descriptive",
                        "source": q_data["source"],
                    }
                )

        logger.info("Generated %d raw questions", len(all_questions))

        # Step 3: Smart Selection with fallback
        try:
            selected = selector.select_questions(
                all_questions, difficulty_distribution, num_questions
            )
            logger.info("Smart selection successful")
        except Exception as e:
            logger.warning("Smart selection failed: %s", e)
            # Simple fallback: take first N questions (use islice to satisfy type checker)
            import itertools
            selected = list(itertools.islice(all_questions, num_questions))

        # Step 4: Structure paper with fallback
        try:
            sections = structurer.structure_paper(selected, exam_pattern, total_marks)
            logger.info("Paper structuring successful")
        except Exception as e:
            logger.warning("Paper structuring failed: %s", e)
            # Simple fallback: one section with all questions
            sections = [{
                "name": "Section A",
                "instructions": "Answer all questions",
                "questions": selected,
                "total_marks": sum(q["marks"] for q in selected)
            }]

        # Build final paper object
        paper_id = str(uuid.uuid4())
        paper = {
            "id": paper_id,
            "subject": subject,
            "university_name": university_name,
            "semester": semester,
            "syllabus": syllabus,
            "exam_pattern": exam_pattern,
            "total_marks": total_marks,
            "duration_minutes": duration_minutes,
            "num_questions": len(selected),
            "difficulty_distribution": difficulty_distribution,
            "questions": selected,
            "sections": sections,
            "syllabus_topics": important_topics,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        # Save to database
        save_paper(paper)

        logger.info("Paper generated successfully: %s", paper_id)
        return jsonify(paper)

    except Exception as e:
        logger.exception("Error generating paper")
        return jsonify({"error": str(e)}), 500


@app.route("/api/papers", methods=["GET"])
def list_papers():
    try:
        papers = get_all_papers()
        return jsonify(papers)
    except Exception as e:
        logger.exception("Error listing papers")
        return jsonify({"error": str(e)}), 500


@app.route("/api/papers/<paper_id>", methods=["GET"])
def get_paper(paper_id):
    try:
        paper = get_paper_by_id(paper_id)
        if paper is None:
            return jsonify({"error": "Paper not found"}), 404
        return jsonify(paper)
    except Exception as e:
        logger.exception("Error getting paper")
        return jsonify({"error": str(e)}), 500


@app.route("/api/papers/<paper_id>", methods=["DELETE"])
def delete_paper(paper_id):
    try:
        deleted = delete_paper_by_id(paper_id)
        if not deleted:
            return jsonify({"error": "Paper not found"}), 404
        return jsonify({"message": "Paper deleted successfully"})
    except Exception as e:
        logger.exception("Error deleting paper")
        return jsonify({"error": str(e)}), 500


@app.route("/api/papers/<paper_id>/pdf", methods=["GET"])
def export_pdf(paper_id):
    try:
        paper = get_paper_by_id(paper_id)
        if paper is None:
            return jsonify({"error": "Paper not found"}), 404

        filepath = pdf_gen.generate_pdf(paper)
        return send_file(
            filepath,
            as_attachment=True,
            download_name=f"{paper['subject'].replace(' ', '_')}_Question_Paper.pdf",
            mimetype="application/pdf",
        )
    except Exception as e:
        logger.exception("Error exporting PDF")
        return jsonify({"error": str(e)}), 500


@app.route("/api/subjects", methods=["GET"])
def list_subjects():
    subjects = [
        "Computer Architecture and Parallel Processing",
        "Computer Networks",
        "Software Engineering",
        "Operating Systems",
        "Java and .NET and C#",
        "Data Structures",
        "Database Systems",
        "Artificial Intelligence",
        "Web Development",
        "IoT and Cloud Computing",
        "Linux and Shell Scripts",
        "Network Security",
        "Wireless Networks",
        "Python Programming",
        "R Programming",
        "Machine Learning",
        "Big Data Analytics",
        "Data Mining and Date Warehousing",
    ]
    return jsonify(subjects)


@app.route("/api/analyze-syllabus", methods=["POST"])
def analyze_syllabus():
    try:
        data = request.get_json()
        syllabus = data.get("syllabus", "").strip()
        if not syllabus:
            return jsonify({"error": "Syllabus is required"}), 400

        topics = nlp.extract_topics(syllabus)
        units = nlp.extract_units(syllabus)

        return jsonify({"topics": topics, "units": units})
    except Exception as e:
        logger.exception("Error analyzing syllabus")
        return jsonify({"error": str(e)}), 500


@app.route("/api/pyq-stats/<subject>", methods=["GET"])
def pyq_stats(subject):
    """Get PYQ statistics for a subject."""
    try:
        stats = get_pyq_stats_by_subject(subject)
        return jsonify(stats)
    except Exception as e:
        logger.exception("Error getting PYQ stats")
        return jsonify({"error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "AI Question Paper Generator API is running"})


def _classify_question_type(question: str) -> str:
    q_lower = question.lower()
    if any(kw in q_lower for kw in ["explain", "describe", "discuss", "elaborate"]):
        return "descriptive"
    elif any(kw in q_lower for kw in ["compare", "differentiate", "contrast"]):
        return "comparative"
    elif any(kw in q_lower for kw in ["derive", "prove", "calculate"]):
        return "analytical"
    elif any(kw in q_lower for kw in ["write a program", "implement", "code"]):
        return "programming"
    elif any(kw in q_lower for kw in ["diagram", "draw", "illustrate"]):
        return "diagrammatic"
    elif any(kw in q_lower for kw in ["list", "enumerate", "name"]):
        return "listing"
    elif any(kw in q_lower for kw in ["what is", "define", "short note"]):
        return "definition"
    else:
        return "descriptive"


if __name__ == "__main__":
    logger.info("Starting AI Question Paper Generator API...")
    logger.info("Server running at http://%s:%d", FLASK_HOST, FLASK_PORT)
    app.run(
        host=FLASK_HOST,
        port=FLASK_PORT,
        debug=FLASK_DEBUG,
        threaded=True,        # Handle multiple requests concurrently
        use_reloader=False,   # Prevent double model-loading in debug mode
    )

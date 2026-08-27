import uuid
import logging
from datetime import datetime, timezone

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

from config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG, T5_MODEL_NAME, BERT_MODEL_NAME
from database.db import (
    init_db,
    save_paper,
    get_all_papers,
    get_paper_by_id,
    delete_paper_by_id,
    update_paper,
    get_pyq_stats_by_subject,
    get_pyq_questions_paginated,
    get_all_pyq_analytics,
    get_solutions_for_questions,
)
from utils.nlp_processor import NLPProcessor
from utils.ai_engine import AIEngine
from utils.smart_selector import SmartSelector
from utils.paper_structurer import PaperStructurer
from utils.pdf_generator import PDFGenerator
from utils.bloom_classifier import BloomClassifier
from utils.rag_engine import VectorRAGEngine
from utils.answer_evaluator import AnswerEvaluator
from utils.mcq_generator import MCQGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
# Allow all origins (frontend could be on Vercel, Netlify, or local network IP)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # type: ignore

# Initialize components
nlp = NLPProcessor()
ai_engine = AIEngine(T5_MODEL_NAME, BERT_MODEL_NAME)
selector = SmartSelector(ai_engine)
structurer = PaperStructurer()
pdf_gen = PDFGenerator()
bloom = BloomClassifier()
rag_engine = VectorRAGEngine(ai_engine)
evaluator = AnswerEvaluator(ai_engine)
mcq_generator = MCQGenerator()

# Initialize database
init_db()

# Eagerly load AI models at startup so the first HTTP request doesn't
# trigger a multi-minute model download / load that times out the client.
logger.info("Pre-loading AI models at startup (this may take a few minutes on first run)...")
try:
    ai_engine.load_models()
    logger.info("AI models loaded successfully.")
    # Build Vector RAG index
    try:
        pyqs = get_pyq_questions_paginated(limit=3000)["questions"]
        rag_engine.build_index(pyqs)
    except Exception as _rag_err:
        logger.warning("Vector RAG indexing deferred: %s", _rag_err)
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
        organization_name = data.get("organization_name", "").strip()
        semester = data.get("semester", "").strip()

        # Extract exam pattern details for certification pattern
        exam_structure = data.get("exam_structure", {})
        short_questions_count = int(data.get("short_questions_count", 5))
        short_questions_marks = int(data.get("short_questions_marks", 2))
        short_questions_total = int(data.get("short_questions_total", 10))
        short_questions_choice_generate = int(data.get("short_questions_choice_generate", 7))
        short_questions_choice_attempt = int(data.get("short_questions_choice_attempt", 5))
        long_questions_count = int(data.get("long_questions_count", 8))
        long_questions_marks = int(data.get("long_questions_marks", 15))
        long_questions_total = int(data.get("long_questions_total", 60))
        long_questions_units = int(data.get("long_questions_units", 4))
        long_questions_per_unit = int(data.get("long_questions_per_unit", 2))

        if not subject or not syllabus:
            return jsonify({"error": "Subject and syllabus are required"}), 400
        if len(syllabus) < 10:
            return jsonify({"error": "Syllabus must be at least 10 characters"}), 400

        logger.info("Generating paper for subject: %s, pattern: %s", subject, exam_pattern)
        logger.info("Exam pattern details: short=%d@%d, long=%d@%d", 
                    short_questions_count, short_questions_marks, 
                    long_questions_count, long_questions_marks)

        # Step 1: NLP — Extract topics and units
        topics = nlp.extract_topics(syllabus)
        units = nlp.extract_units(syllabus)
        unit_topic_map = nlp.map_topics_to_units(syllabus)
        important_topics = nlp.get_important_topics(syllabus, top_n=20)

        logger.info("Extracted %d topics, %d units", len(topics), len(units))

        # Step 2: AI — Generate questions using PYQ patterns with fallbacks
        all_questions = []
        
        # For certification pattern, generate specific numbers of short and long questions
        if exam_pattern == "certification":
            # Generate short questions (2 marks each)
            short_questions_per_topic = max(1, (short_questions_count * 2) // max(len(important_topics), 1))
            long_questions_per_topic = max(1, (long_questions_count * 2) // max(len(important_topics), 1))
            
            for topic in important_topics:
                # Find which unit this topic belongs to
                topic_unit = "Unit 1"
                for unit_name, unit_topics in unit_topic_map.items():
                    unit_topics_list: list[str] = list(unit_topics)
                    if any(topic.lower() in t.lower() or t.lower() in topic.lower() for t in unit_topics_list):
                        topic_unit = unit_name
                        break

                # Generate short questions
                try:
                    pyq_generated = ai_engine.generate_questions_with_pyq_patterns(
                        subject, f"{topic} (short answer)", short_questions_per_topic
                    )
                    logger.info("PYQ generation successful for short questions on topic: %s", topic)
                except Exception as e:
                    logger.warning("PYQ generation failed for %s: %s", topic, e)
                    pyq_generated = ai_engine._generate_fallback_questions_dict(topic, short_questions_per_topic)

                for q_data in pyq_generated[:short_questions_per_topic]:
                    all_questions.append({
                        "id": str(uuid.uuid4()),
                        "text": q_data["text"],
                        "marks": short_questions_marks,
                        "difficulty": q_data["difficulty"],
                        "unit": topic_unit,
                        "topic": topic,
                        "question_type": "short",
                        "source": q_data["source"],
                    })

                # Generate long questions
                try:
                    pyq_generated = ai_engine.generate_questions_with_pyq_patterns(
                        subject, f"{topic} (long answer)", long_questions_per_topic
                    )
                    logger.info("PYQ generation successful for long questions on topic: %s", topic)
                except Exception as e:
                    logger.warning("PYQ generation failed for %s: %s", topic, e)
                    pyq_generated = ai_engine._generate_fallback_questions_dict(topic, long_questions_per_topic)

                for q_data in pyq_generated[:long_questions_per_topic]:
                    all_questions.append({
                        "id": str(uuid.uuid4()),
                        "text": q_data["text"],
                        "marks": long_questions_marks,
                        "difficulty": q_data["difficulty"],
                        "unit": topic_unit,
                        "topic": topic,
                        "question_type": "long",
                        "source": q_data["source"],
                    })
        else:
            # Original logic for other patterns
            questions_per_topic = max(2, (num_questions * 3) // max(len(important_topics), 1))

            for topic in important_topics:
                # Find which unit this topic belongs to
                topic_unit = "Unit 1"
                for unit_name, unit_topics in unit_topic_map.items():
                    unit_topics_list: list[str] = list(unit_topics)
                    if any(topic.lower() in t.lower() or t.lower() in topic.lower() for t in unit_topics_list):
                        topic_unit = unit_name
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
        if exam_pattern == "certification":
            # For certification pattern, select specific numbers of short and long questions
            short_questions = [q for q in all_questions if q.get("question_type") == "short"]
            long_questions = [q for q in all_questions if q.get("question_type") == "long"]
            
            # Select the required number of questions
            selected_short = short_questions[:short_questions_choice_generate]  # Generate more than needed
            selected_long = long_questions[:long_questions_count]
            selected = selected_short + selected_long
            
            logger.info("Certification pattern: selected %d short, %d long questions", 
                       len(selected_short), len(selected_long))
        else:
            # Original logic for other patterns
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
            # Pass exam pattern details to structurer for certification pattern
            if exam_pattern == "certification":
                sections = structurer.structure_certification_paper(
                    selected, 
                    short_questions_count, short_questions_marks, short_questions_total,
                    short_questions_choice_generate, short_questions_choice_attempt,
                    long_questions_count, long_questions_marks, long_questions_total
                )
            else:
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

        # Step 5: Bloom's Taxonomy Cognitive Classification
        selected = bloom.tag_questions(selected)
        for sec in sections:
            sec_questions = sec.get("questions")
            if isinstance(sec_questions, list):
                sec["questions"] = bloom.tag_questions(sec_questions)

        # Build final paper object
        paper_id = str(uuid.uuid4())
        paper = {
            "id": paper_id,
            "subject": subject,
            "organization_name": organization_name,
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


@app.route("/api/papers/<paper_id>", methods=["PUT"])
def modify_paper(paper_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        updated = update_paper(paper_id, data)
        if not updated:
            return jsonify({"error": "Paper not found or no changes made"}), 404
        return jsonify({"message": "Paper updated successfully", "paper": data})
    except Exception as e:
        logger.exception("Error updating paper")
        return jsonify({"error": str(e)}), 500


@app.route("/api/papers/<paper_id>/solutions", methods=["GET"])
def get_paper_solutions(paper_id):
    try:
        paper = get_paper_by_id(paper_id)
        if paper is None:
            return jsonify({"error": "Paper not found"}), 404

        questions = paper.get("questions", [])
        from utils.solution_generator import generate_smart_solution
        from database.db import get_connection
        conn = get_connection()
        cursor = conn.cursor()
        solutions = [generate_smart_solution(q, db_cursor=cursor) for q in questions]
        conn.close()
        return jsonify({
            "paper_id": paper_id,
            "subject": paper.get("subject", ""),
            "solutions": solutions
        })
    except Exception as e:
        logger.exception("Error generating solutions for paper")
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


@app.route("/api/question-bank", methods=["GET"])
def get_question_bank():
    """Fetch filtered/paginated question bank entries."""
    try:
        subject = request.args.get("subject", None)
        difficulty = request.args.get("difficulty", None)
        question_type = request.args.get("type", None)
        search = request.args.get("search", None)
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))

        result = get_pyq_questions_paginated(
            subject=subject,
            difficulty=difficulty,
            question_type=question_type,
            search=search,
            page=page,
            limit=limit,
        )
        return jsonify(result)
    except Exception as e:
        logger.exception("Error querying question bank")
        return jsonify({"error": str(e)}), 500


@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    """Get overall platform analytics, topic frequencies, and PYQ stats."""
    try:
        data = get_all_pyq_analytics()
        return jsonify(data)
    except Exception as e:
        logger.exception("Error getting analytics data")
        return jsonify({"error": str(e)}), 500


@app.route("/api/evaluate-answer", methods=["POST"])
def evaluate_student_answer():
    """AI Auto-Grading & Semantic Evaluation of a student's answer."""
    try:
        data = request.get_json() or {}
        question = data.get("question", "").strip()
        model_answer = data.get("model_answer", "").strip()
        student_answer = data.get("student_answer", "").strip()
        max_marks = int(data.get("max_marks", 5))

        if not question:
            return jsonify({"error": "Question text is required"}), 400

        result = evaluator.evaluate_answer(
            question_text=question,
            model_answer=model_answer,
            student_answer=student_answer,
            max_marks=max_marks
        )
        return jsonify(result)
    except Exception as e:
        logger.exception("Error evaluating answer")
        return jsonify({"error": str(e)}), 500


@app.route("/api/generate-mcq", methods=["POST"])
def generate_mcqs():
    """Generate 4-option certification MCQs with distractors & explanations."""
    try:
        data = request.get_json() or {}
        subject = data.get("subject", "AWS").strip()
        topic = data.get("topic", "").strip()
        count = int(data.get("count", 5))

        mcqs = mcq_generator.generate_mcqs_for_subject(
            subject=subject,
            topic=topic,
            count=count,
            rag_engine=rag_engine
        )
        return jsonify({"subject": subject, "topic": topic, "mcqs": mcqs})
    except Exception as e:
        logger.exception("Error generating MCQs")
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
        "AWS Cloud Fundamentals",
        "AWS Compute (EC2 & Auto Scaling)",
        "AWS Storage & Databases",
        "AWS Networking (VPC, Route 53, CloudFront)",
        "AWS Security & IAM",
        "AWS Serverless (Lambda, API Gateway, Step Functions)",
        "Docker & Containerization",
        "Kubernetes & Container Orchestration",
        "CI/CD Pipelines",
        "Jenkins",
        "Terraform & Infrastructure as Code",
        "Ansible & Configuration Management",
        "Linux Administration & Shell Scripting",
        "Git & Version Control",
        "Monitoring & Logging (CloudWatch, Prometheus, Grafana)",
        "Site Reliability Engineering (SRE)",
        "DevSecOps & Cloud Security",
        "Microservices Architecture",
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

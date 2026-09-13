import re
import math
import logging
from typing import Dict, Any, List, Optional
from utils.llm_gateway import LLMGateway

logger = logging.getLogger(__name__)

class AnswerEvaluator:
    """
    AI Auto-Grading & Semantic Evaluation Engine.
    Uses LLM-as-a-Judge with multi-dimensional rubrics (technical correctness,
    command/syntax precision, architectural depth, and edge cases),
    with an embedding/semantic similarity fallback when offline.
    """

    def __init__(self, ai_engine=None, llm_gateway: Optional[LLMGateway] = None):
        self.ai_engine = ai_engine
        self.llm_gateway = llm_gateway or (getattr(ai_engine, "llm_gateway", None) if ai_engine else None) or LLMGateway()

    def evaluate_answer(
        self,
        question_text: str,
        model_answer: str,
        student_answer: str,
        max_marks: int = 5
    ) -> Dict[str, Any]:
        """Evaluate a student's answer against the question and rubric."""
        student_text = student_answer.strip()
        model_text = model_answer.strip()

        if not student_text:
            return {
                "score": 0.0,
                "max_marks": max_marks,
                "percentage": 0,
                "grade": "F",
                "semantic_similarity": 0.0,
                "concept_coverage": 0.0,
                "strengths": [],
                "missing_points": ["No answer submitted."],
                "feedback": "No answer was provided. Please explain the core principles, syntax, and operational mechanics required by the question.",
                "improvement_tips": ["Review the core question requirements and submit an answer covering architecture and implementation steps."],
                "evaluator_mode": "no_submission"
            }

        # 1. Try LLM-as-a-Judge evaluation
        if self.llm_gateway and self.llm_gateway.is_available():
            llm_result = self._evaluate_with_llm(question_text, model_text, student_text, max_marks)
            if llm_result:
                return llm_result

        # 2. Resilient Offline Fallback (Sentence-BERT + Entity Matching)
        return self._evaluate_with_heuristics(question_text, model_text, student_text, max_marks)

    def _evaluate_with_llm(
        self, question_text: str, model_text: str, student_text: str, max_marks: int
    ) -> Optional[Dict[str, Any]]:
        """Perform evaluation using LLM-as-a-Judge."""
        system_prompt = (
            "You are a strict, fair university professor and senior cloud architect grading student examination answers in DevOps and AWS.\n"
            "Evaluate the student's submission against the question and reference model answer.\n"
            "Grade objectively based on:\n"
            "1. Technical & Conceptual Correctness (40%)\n"
            "2. Architecture / CLI Command / Syntax Precision (30%)\n"
            "3. Completeness & Edge Cases (20%)\n"
            "4. Clarity & Organization (10%)\n\n"
            "Return a JSON object with this exact schema:\n"
            "{\n"
            "  \"score\": float (between 0.0 and max_marks),\n"
            "  \"percentage\": int (0 to 100),\n"
            "  \"grade\": \"A+\" | \"A\" | \"B\" | \"C\" | \"D\" | \"Needs Improvement\",\n"
            "  \"concept_coverage\": int (0 to 100),\n"
            "  \"semantic_similarity\": int (0 to 100),\n"
            "  \"strengths\": [\"string\", \"string\"],\n"
            "  \"missing_points\": [\"string\", \"string\"],\n"
            "  \"feedback\": \"Detailed, constructive paragraph evaluating technical accuracy, reasoning, and any misconceptions.\",\n"
            "  \"improvement_tips\": [\"Actionable tip 1\", \"Actionable tip 2\"]\n"
            "}"
        )

        user_prompt = (
            f"Question: {question_text}\n"
            f"Max Marks: {max_marks}\n\n"
            f"Reference Model Answer / Key Concepts:\n{model_text or 'Standard enterprise cloud architecture and production best practices.'}\n\n"
            f"Student's Submission:\n{student_text}\n"
        )

        result = self.llm_gateway.generate_json(system_prompt, user_prompt, temperature=0.2)
        if isinstance(result, dict) and "score" in result:
            try:
                score = round(float(result["score"]), 1)
                score = max(0.0, min(float(max_marks), score))
                pct = int(result.get("percentage", round((score / max_marks) * 100)))

                return {
                    "score": score,
                    "max_marks": max_marks,
                    "percentage": pct,
                    "grade": result.get("grade", "B"),
                    "semantic_similarity": float(result.get("semantic_similarity", pct)),
                    "concept_coverage": float(result.get("concept_coverage", pct)),
                    "strengths": result.get("strengths", ["Addressed basic concepts"]),
                    "missing_points": result.get("missing_points", []),
                    "feedback": result.get("feedback", "Submission reviewed successfully."),
                    "improvement_tips": result.get("improvement_tips", ["Keep practicing real-world CLI examples."]),
                    "evaluator_mode": f"LLM Judge ({self.llm_gateway._provider})"
                }
            except Exception as e:
                logger.warning("Error parsing LLM evaluation result: %s", e)

        return None

    def _evaluate_with_heuristics(
        self, question_text: str, model_text: str, student_text: str, max_marks: int
    ) -> Dict[str, Any]:
        """Fallback evaluation using Sentence-BERT cosine similarity and domain entity matching."""
        if len(model_text) < 20:
            model_text = f"Explain the core terminology, working principles, architecture, commands, and best practices for {question_text}."

        # 1. Semantic Similarity Score via Sentence-BERT
        semantic_sim = self._calculate_semantic_similarity(model_text, student_text)

        # 2. Key Concept / Entity Extraction
        model_keywords = self._extract_technical_keywords(model_text + " " + question_text)
        student_keywords = self._extract_technical_keywords(student_text)

        matched_concepts = [kw for kw in model_keywords if any(kw in sk or sk in kw for sk in student_keywords)]
        missing_concepts = [kw for kw in model_keywords if kw not in matched_concepts][:5]

        concept_coverage = len(matched_concepts) / max(len(model_keywords), 1)

        # 3. Completeness & Length Calibration
        length_ratio = min(1.0, len(student_text.split()) / max(25, len(model_text.split()) * 0.4))

        # 50% Semantic understanding + 35% Key concept accuracy + 15% Completeness
        raw_pct = (0.50 * semantic_sim) + (0.35 * concept_coverage) + (0.15 * length_ratio)
        raw_pct = max(0.0, min(1.0, raw_pct))

        calibrated_pct = math.pow(raw_pct, 0.85)
        final_score = round(calibrated_pct * max_marks, 1)
        percentage = round((final_score / max_marks) * 100)


        if percentage >= 90:
            grade = "A+"
        elif percentage >= 80:
            grade = "A"
        elif percentage >= 70:
            grade = "B"
        elif percentage >= 60:
            grade = "C"
        elif percentage >= 45:
            grade = "D"
        else:
            grade = "Needs Improvement"

        feedback_lines = []
        if percentage >= 85:
            feedback_lines.append("Excellent answer! Demonstrated strong conceptual clarity and core technical accuracy.")
        elif percentage >= 65:
            feedback_lines.append("Good attempt. The foundational mechanism was understood, but some technical details or commands were omitted.")
        else:
            feedback_lines.append("Partial answer. The submission covers basic concepts but lacks critical architectural components and implementation steps.")

        tips = []
        if missing_concepts:
            tips.append(f"Consider elaborating on: {', '.join(missing_concepts[:3])}.")
        if length_ratio < 0.6:
            tips.append("Expand on the operational steps and real-world production best practices.")
        if not tips:
            tips.append("Great job! Keep adding relevant CLI examples or architecture diagrams to maximize score.")

        return {
            "score": final_score,
            "max_marks": max_marks,
            "percentage": percentage,
            "grade": grade,
            "semantic_similarity": round(semantic_sim * 100, 1),
            "concept_coverage": round(concept_coverage * 100, 1),
            "strengths": matched_concepts[:5] if matched_concepts else ["Attempted initial concept"],
            "missing_points": missing_concepts if missing_concepts else ["Minor formatting / syntax details"],
            "feedback": " ".join(feedback_lines),
            "improvement_tips": tips,
            "evaluator_mode": "Offline Semantic Embeddings"
        }

    def _calculate_semantic_similarity(self, text_a: str, text_b: str) -> float:
        """Calculate cosine semantic similarity between model answer and student answer."""
        if self.ai_engine and hasattr(self.ai_engine, "_bert_model") and self.ai_engine._bert_model:
            try:
                from sentence_transformers import util
                emb_a = self.ai_engine._bert_model.encode(text_a, convert_to_tensor=True)
                emb_b = self.ai_engine._bert_model.encode(text_b, convert_to_tensor=True)
                cos_sim = util.cos_sim(emb_a, emb_b).item()
                return float(max(0.0, min(1.0, (cos_sim + 1.0) / 2.0)))
            except Exception as e:
                logger.warning("BERT semantic similarity failed (%s). Using word-overlap.", e)

        words_a = set(re.findall(r"\b\w{3,}\b", text_a.lower()))
        words_b = set(re.findall(r"\b\w{3,}\b", text_b.lower()))
        if not words_a or not words_b:
            return 0.0
        intersection = words_a.intersection(words_b)
        union = words_a.union(words_b)
        return float(len(intersection) / len(union))

    def _extract_technical_keywords(self, text: str) -> List[str]:
        """Extract domain keywords, CLI commands, and technical entities."""
        stopwords = {
            "the", "and", "for", "with", "this", "that", "from", "are", "which",
            "what", "when", "where", "how", "can", "should", "will", "does", "explain",
            "describe", "detail", "using", "into", "their", "have", "been", "about"
        }
        words = re.findall(r"\b[a-zA-Z0-9_\-\.]{3,}\b", text.lower())
        keywords = []
        for w in words:
            if w not in stopwords and not w.isdigit() and len(w) > 3:
                if w not in keywords:
                    keywords.append(w)
        return keywords[:12]

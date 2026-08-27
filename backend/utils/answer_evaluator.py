import re
import math
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class AnswerEvaluator:
    """
    Semantic Answer Evaluation & AI Auto-Grading Engine.
    Uses Sentence-BERT embeddings and technical keyword entity extraction
    to grade student answers against model solutions and generate constructive feedback.
    """

    def __init__(self, ai_engine=None):
        self.ai_engine = ai_engine

    def evaluate_answer(
        self,
        question_text: str,
        model_answer: str,
        student_answer: str,
        max_marks: int = 5
    ) -> Dict[str, Any]:
        """Evaluate a student's answer against the model solution and rubric."""
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
                "missing_points": ["No answer provided."],
                "feedback": "No answer was submitted. Please write an explanation addressing the question requirements.",
                "improvement_tips": ["Provide an answer covering the core principles, syntax, and operational steps."]
            }

        # If model answer is short or placeholder, fallback to key terms in question
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

        # Weighted final score formula
        # 50% Semantic understanding + 35% Key concept accuracy + 15% Completeness
        raw_pct = (0.50 * semantic_sim) + (0.35 * concept_coverage) + (0.15 * length_ratio)
        raw_pct = max(0.0, min(1.0, raw_pct))

        # Apply realistic exam grading scale
        calibrated_pct = math.pow(raw_pct, 0.85)  # slight curve for natural language variability
        final_score = round(calibrated_pct * max_marks, 1)
        percentage = int(round((final_score / max_marks) * 100))

        # Grade calculation
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

        # Generate constructive feedback
        feedback_lines = []
        if percentage >= 85:
            feedback_lines.append("Excellent answer! You demonstrated strong conceptual clarity and technical accuracy.")
        elif percentage >= 65:
            feedback_lines.append("Good attempt. The core mechanism was understood, but some technical details or commands were omitted.")
        else:
            feedback_lines.append("Partial answer. The submission covers basic ideas but lacks critical architectural concepts and implementation steps.")

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
            "missing_points": missing_concepts if missing_concepts else ["Minor formatting / examples"],
            "feedback": " ".join(feedback_lines),
            "improvement_tips": tips
        }

    def _calculate_semantic_similarity(self, text_a: str, text_b: str) -> float:
        """Calculate cosine semantic similarity between model answer and student answer."""
        if self.ai_engine and hasattr(self.ai_engine, "_bert_model") and self.ai_engine._bert_model:
            try:
                import torch
                from sentence_transformers import util
                emb_a = self.ai_engine._bert_model.encode(text_a, convert_to_tensor=True)
                emb_b = self.ai_engine._bert_model.encode(text_b, convert_to_tensor=True)
                cos_sim = util.cos_sim(emb_a, emb_b).item()
                # Normalize cosine similarity to [0, 1] range
                return float(max(0.0, min(1.0, (cos_sim + 1.0) / 2.0)))
            except Exception as e:
                logger.warning("BERT semantic similarity failed (%s). Using word-overlap fallback.", e)

        # Fallback word-overlap Jaccard/TF-IDF similarity
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

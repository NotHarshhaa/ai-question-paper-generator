import re
from typing import Dict, Any, List

class BloomClassifier:
    """
    Classifies questions into Bloom's Revised Taxonomy cognitive levels:
    1. Remember (Knowledge retrieval, definitions, commands)
    2. Understand (Explaining ideas, concepts, comparing)
    3. Apply (Using information in new situations, writing code, executing commands)
    4. Analyze (Distinguishing parts, troubleshooting, identifying root causes)
    5. Evaluate (Justifying decisions, comparing architectures, trade-offs)
    6. Create (Designing systems, building architectures, synthesizing solutions)
    """

    BLOOM_KEYWORDS = {
        "Remember": [
            "what is", "define", "list", "name", "state", "identify", "which command",
            "default port", "syntax", "mention", "enumerate", "who created", "when to use",
            "abbreviation", "stands for", "retrieve", "recall", "state the purpose"
        ],
        "Understand": [
            "explain", "describe", "discuss", "clarify", "differentiate", "distinguish",
            "summarize", "paraphrase", "interpret", "outline", "illustrate", "why does",
            "how does", "what happens when", "give an example", "working principle"
        ],
        "Apply": [
            "how to configure", "how to install", "how to write", "implement", "execute",
            "demonstrate", "write a script", "write a playbook", "write a dockerfile",
            "deploy", "provision", "configure", "use", "apply", "set up", "schedule"
        ],
        "Analyze": [
            "troubleshoot", "debug", "diagnose", "why is", "failed with", "crashloopbackoff",
            "investigate", "break down", "analyze", "inspect", "identify the bottleneck",
            "root cause", "trace", "deconstruct", "differentiate between the failure modes"
        ],
        "Evaluate": [
            "compare and contrast", "evaluate", "assess", "justify", "which is better",
            "trade-offs", "pros and cons", "critique", "validate", "recommend", "best approach",
            "security implications", "cost optimization trade-off"
        ],
        "Create": [
            "design", "architect", "propose a solution", "build a resilient",
            "formulate", "construct", "create an end-to-end", "develop a pipeline",
            "plan a multi-region", "generate", "synthesize", "design high availability"
        ],
    }

    BLOOM_DESCRIPTIONS = {
        "Remember": "Recall facts, terminology, basic commands, and definitions.",
        "Understand": "Explain ideas, operational mechanisms, and core concepts.",
        "Apply": "Use learned concepts to implement configs, scripts, or deployments.",
        "Analyze": "Troubleshoot errors, break down systems, and diagnose bottlenecks.",
        "Evaluate": "Make judgments, assess trade-offs, and critique architecture designs.",
        "Create": "Design and construct end-to-end resilient cloud & DevOps architectures.",
    }

    def classify_question(self, question_text: str, question_type: str = "") -> Dict[str, Any]:
        """Classify a single question text into its Bloom taxonomy level."""
        text_lower = question_text.lower().strip()
        matched_level = "Understand"  # default
        highest_score = 0

        for level, keywords in self.BLOOM_KEYWORDS.items():
            score = 0
            for kw in keywords:
                if kw in text_lower:
                    # Higher weight if keyword is at the beginning
                    if text_lower.startswith(kw):
                        score += 3
                    else:
                        score += 1

            if score > highest_score:
                highest_score = score
                matched_level = level

        # Context adjustments based on question type
        if highest_score == 0:
            if question_type == "short" or len(text_lower) < 40:
                matched_level = "Remember"
            elif any(w in text_lower for w in ["design", "architecture", "multi-region", "disaster recovery"]):
                matched_level = "Create"
            elif any(w in text_lower for w in ["troubleshoot", "debug", "error", "failed", "crash"]):
                matched_level = "Analyze"
            else:
                matched_level = "Understand"

        level_order = {
            "Remember": 1,
            "Understand": 2,
            "Apply": 3,
            "Analyze": 4,
            "Evaluate": 5,
            "Create": 6,
        }

        return {
            "level": matched_level,
            "order": level_order.get(matched_level, 2),
            "description": self.BLOOM_DESCRIPTIONS.get(matched_level, ""),
        }

    def tag_questions(self, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Tag a batch of question dicts with their Bloom's cognitive level."""
        for q in questions:
            q_text = q.get("text") or q.get("question") or ""
            q_type = q.get("question_type") or ""
            bloom_info = self.classify_question(q_text, q_type)
            q["bloom_level"] = bloom_info["level"]
            q["bloom_order"] = bloom_info["order"]
        return questions

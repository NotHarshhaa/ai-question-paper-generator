import re
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class BloomClassifier:
    """
    Classifies questions into Bloom's Revised Taxonomy cognitive levels:
    1. Remember (Knowledge retrieval, definitions, basic CLI commands)
    2. Understand (Explaining mechanisms, concepts, architectural components)
    3. Apply (Writing scripts, Dockerfiles, YAML manifests, running deployments)
    4. Analyze (Troubleshooting failure modes, diagnosing bottlenecks, root-cause analysis)
    5. Evaluate (Trade-off analysis, architectural critique, security/cost audits)
    6. Create (Designing end-to-end resilient, scalable, multi-region cloud architectures)
    """

    BLOOM_DESCRIPTIONS = {
        "Remember": "Recall facts, terminology, basic commands, and definitions.",
        "Understand": "Explain ideas, operational mechanisms, and core concepts.",
        "Apply": "Use learned concepts to implement configs, scripts, or deployments.",
        "Analyze": "Troubleshoot errors, break down systems, and diagnose bottlenecks.",
        "Evaluate": "Make judgments, assess trade-offs, and critique architecture designs.",
        "Create": "Design and construct end-to-end resilient cloud & DevOps architectures.",
    }

    LEVEL_ORDER = {
        "Remember": 1,
        "Understand": 2,
        "Apply": 3,
        "Analyze": 4,
        "Evaluate": 5,
        "Create": 6,
    }

    def __init__(self, llm_gateway=None):
        self.llm_gateway = llm_gateway

    def classify_question(self, question_text: str, question_type: str = "") -> Dict[str, Any]:
        """Classify a single question text into its Bloom taxonomy level using context-aware heuristics."""
        text_lower = question_text.lower().strip()

        # Check high-order cognitive domains FIRST so questions like
        # "What is the architecture to design a multi-region VPC?" aren't trapped in "Remember".
        
        # 6. Create: Designing, architecting, building end-to-end systems
        create_patterns = [
            r"\bdesign\b", r"\barchitect\b", r"\bbuild a resilient\b", r"\bpropose a solution\b",
            r"\bend-to-end\b", r"\bdisaster recovery\b", r"\bmulti-region\b", r"\bhigh availability\b",
            r"\bsynthesize\b", r"\bconstruct\b", r"\bdevelop a pipeline\b", r"\bplan a migration\b"
        ]
        if any(re.search(p, text_lower) for p in create_patterns):
            return self._build_result("Create")

        # 5. Evaluate: Trade-offs, auditing, comparing architectural decisions
        eval_patterns = [
            r"\bcompare and contrast\b", r"\bevaluate\b", r"\btrade-offs?\b", r"\bpros and cons\b",
            r"\bcritique\b", r"\bsecurity implications\b", r"\bcost optimization\b", r"\bwhich is better\b",
            r"\bjustify\b", r"\bbenchmark\b", r"\brecommend the best\b"
        ]
        if any(re.search(p, text_lower) for p in eval_patterns):
            return self._build_result("Evaluate")

        # 4. Analyze: Troubleshooting, debugging, failure modes, root causes
        analyze_patterns = [
            r"\btroubleshoot\b", r"\bdebug\b", r"\bdiagnose\b", r"\bcrashloopbackoff\b",
            r"\broot cause\b", r"\bbottleneck\b", r"\bfailure mode\b", r"\bwhy did .+ fail\b",
            r"\bout of memory\b", r"\boomkill\b", r"\banalyze\b", r"\bdeconstruct\b",
            r"\binspect logs\b", r"\bperformance degradation\b"
        ]
        if any(re.search(p, text_lower) for p in analyze_patterns):
            return self._build_result("Analyze")

        # 3. Apply: Implementing, writing configurations, commands with flags, playbooks
        apply_patterns = [
            r"\bwrite a dockerfile\b", r"\bwrite a playbook\b", r"\bwrite a script\b",
            r"\bwrite a terraform\b", r"\bwrite a manifest\b", r"\bhow to configure\b",
            r"\bhow to install\b", r"\bhow to deploy\b", r"\bimplement\b", r"\bexecute\b",
            r"\bprovision\b", r"\bset up\b", r"\bstep-by-step procedure\b"
        ]
        if any(re.search(p, text_lower) for p in apply_patterns):
            return self._build_result("Apply")

        # 2. Understand: Explaining principles, comparing mechanisms, summarizing
        understand_patterns = [
            r"\bexplain\b", r"\bdescribe\b", r"\bdiscuss\b", r"\bhow does\b",
            r"\bworking principle\b", r"\bwhat happens when\b", r"\bdifferentiate\b",
            r"\bdistinguish between\b", r"\billustrate\b", r"\belaborate\b"
        ]
        if any(re.search(p, text_lower) for p in understand_patterns):
            return self._build_result("Understand")

        # 1. Remember: Factual recall, definitions, naming, default ports
        remember_patterns = [
            r"\bwhat is\b", r"\bdefine\b", r"\blist\b", r"\bname\b", r"\bstate\b",
            r"\bwhich command\b", r"\bdefault port\b", r"\bsyntax\b", r"\babbreviation\b",
            r"\bstands for\b", r"\bidentify\b"
        ]
        if any(re.search(p, text_lower) for p in remember_patterns) or question_type == "short" or len(text_lower) < 40:
            return self._build_result("Remember")

        return self._build_result("Understand")

    def _build_result(self, level: str) -> Dict[str, Any]:
        return {
            "level": level,
            "order": self.LEVEL_ORDER.get(level, 2),
            "description": self.BLOOM_DESCRIPTIONS.get(level, ""),
        }

    def tag_questions(self, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Tag a batch of question dicts with their Bloom's cognitive level."""
        # Try LLM batch classification if available and questions batch is reasonably sized
        if self.llm_gateway and self.llm_gateway.is_available() and len(questions) <= 25:
            llm_tagged = self._tag_with_llm(questions)
            if llm_tagged:
                return llm_tagged

        # Fallback to enhanced context-aware heuristic
        for q in questions:
            q_text = q.get("text") or q.get("question") or ""
            q_type = q.get("question_type") or ""
            bloom_info = self.classify_question(q_text, q_type)
            q["bloom_level"] = bloom_info["level"]
            q["bloom_order"] = bloom_info["order"]
        return questions

    def _tag_with_llm(self, questions: List[Dict[str, Any]]) -> Optional[List[Dict[str, Any]]]:
        if not self.llm_gateway:
            return None
        try:

            items_payload = [
                {"id": q.get("id", str(idx)), "text": q.get("text") or q.get("question") or ""}
                for idx, q in enumerate(questions)
            ]
            system_prompt = (
                "You are an expert pedagogical evaluator. Classify each question into Bloom's Revised Taxonomy:\n"
                "Remember, Understand, Apply, Analyze, Evaluate, Create.\n"
                "Return a JSON array of objects: [{\"id\": str, \"bloom_level\": str}]"
            )
            user_prompt = f"Questions to classify:\n{items_payload}"
            result = self.llm_gateway.generate_json(system_prompt, user_prompt, temperature=0.1)

            if isinstance(result, list):
                mapping = {
                    str(item.get("id")): item.get("bloom_level")
                    for item in result
                    if isinstance(item, dict) and item.get("bloom_level") in self.LEVEL_ORDER
                }
                for idx, q in enumerate(questions):
                    qid = str(q.get("id", str(idx)))
                    if qid in mapping:
                        lvl = mapping[qid]
                        q["bloom_level"] = lvl
                        q["bloom_order"] = self.LEVEL_ORDER[lvl]
                    else:
                        info = self.classify_question(q.get("text", ""))
                        q["bloom_level"] = info["level"]
                        q["bloom_order"] = info["order"]
                return questions
        except Exception as e:
            logger.warning("LLM Bloom taxonomy tagging failed (%s). Using heuristic.", e)
        return None

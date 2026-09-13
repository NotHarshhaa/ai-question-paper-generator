import os
import logging
import re
from typing import List, Dict, Any, Optional
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from sentence_transformers import SentenceTransformer, util
import torch
from database.db import get_pyq_questions_by_subject
from utils.llm_gateway import LLMGateway

logger = logging.getLogger(__name__)

# Set to "1" or "true" to skip T5 loading entirely (uses modern LLM or template fallback)
_DISABLE_T5 = os.getenv("DISABLE_T5_MODEL", "true").lower() in ("1", "true", "yes")


class AIEngine:
    def __init__(self, t5_model_name: str, bert_model_name: str, llm_gateway: Optional[LLMGateway] = None):
        self.t5_model_name = t5_model_name
        self.bert_model_name = bert_model_name
        self.llm_gateway = llm_gateway or LLMGateway()
        self._t5_model = None
        self._t5_tokenizer = None
        self._bert_model = None
        self._loaded = False

    def load_models(self):
        if self._loaded:
            return

        if _DISABLE_T5:
            logger.info("T5 model loading skipped (DISABLE_T5_MODEL=true). Using LLM / Template engine.")
        else:
            logger.info("Loading T5 model: %s", self.t5_model_name)
            try:
                self._t5_tokenizer = AutoTokenizer.from_pretrained(
                    self.t5_model_name, legacy=False
                )
                self._t5_model = AutoModelForSeq2SeqLM.from_pretrained(self.t5_model_name)
                self._t5_model.eval()
                logger.info("T5 model loaded successfully")
            except BaseException as e:
                logger.warning("Failed to load T5 model (%s: %s). Using fallback.", type(e).__name__, e)
                self._t5_model = None
                self._t5_tokenizer = None

        logger.info("Loading BERT/SentenceTransformer model: %s", self.bert_model_name)
        try:
            self._bert_model = SentenceTransformer(self.bert_model_name)
            logger.info("BERT model loaded successfully")
        except BaseException as e:
            logger.warning("Failed to load BERT model (%s: %s). Word-overlap fallback will be used.",
                           type(e).__name__, e)
            self._bert_model = None

        self._loaded = True

    def generate_questions(
        self, topic: str, context: str = "", num_questions: int = 3, subject: str = ""
    ) -> list[str]:
        """Generate questions using LLM first, then T5, then domain templates."""
        # 1. Try LLM generation
        if self.llm_gateway and self.llm_gateway.is_available():
            llm_questions = self._generate_questions_with_llm(subject, topic, num_questions, context)
            if llm_questions:
                return [q["text"] for q in llm_questions][:num_questions]

        self.load_models()
        questions = []

        # 2. Try T5 if enabled and loaded
        if not _DISABLE_T5 and self._t5_model and self._t5_tokenizer:
            try:
                questions = self._generate_with_t5(topic, context, num_questions)
            except BaseException as e:
                logger.warning("T5 generation failed (%s): %s. Using fallback.", type(e).__name__, e)

        # 3. Fallback: domain templates
        if len(questions) < num_questions:
            fallback = self._generate_fallback_questions(topic, num_questions - len(questions))
            questions.extend(fallback)

        return questions[:num_questions]

    def _generate_with_t5(
        self, topic: str, context: str, num_questions: int
    ) -> list[str]:
        if not self._t5_tokenizer or not self._t5_model:
            return []
        questions = []

        if context:
            input_text = f"generate question: {context} <hl> {topic} <hl>"
        else:
            input_text = f"generate question: {topic} is an important concept in cloud computing and DevOps. <hl> {topic} <hl>"

        input_ids = self._t5_tokenizer.encode(input_text, return_tensors="pt", max_length=512, truncation=True)

        with torch.no_grad():
            outputs = self._t5_model.generate(
                input_ids,
                max_length=128,
                num_beams=max(num_questions * 2, 4),
                num_return_sequences=min(num_questions, 5),
                early_stopping=True,
                no_repeat_ngram_size=3,
                temperature=0.8,
            )

        for output in outputs:
            question = self._t5_tokenizer.decode(output, skip_special_tokens=True).strip()
            if question and not question.endswith("?"):
                question += "?"
            if question and len(question) > 10:
                questions.append(question)

        return questions

    def _generate_questions_with_llm(
        self, subject: str, topic: str, num_questions: int, context: str = ""
    ) -> Optional[List[Dict[str, Any]]]:
        """Generate high-quality scenario & architectural exam questions using LLM."""
        system_prompt = (
            "You are an expert cloud architect and technical exam author specializing in DevOps, AWS, and Linux certifications.\n"
            "Generate authentic, high-caliber examination questions adhering to university and industry certification standards.\n"
            "Format your response as a JSON array of objects with the following schema:\n"
            "[\n"
            "  {\n"
            "    \"text\": \"Question text?\",\n"
            "    \"marks\": 5,\n"
            "    \"difficulty\": \"easy\" | \"medium\" | \"hard\",\n"
            "    \"question_type\": \"descriptive\" | \"short\" | \"long\" | \"analytical\"\n"
            "  }\n"
            "]"
        )

        user_prompt = (
            f"Subject: {subject or 'Cloud & DevOps Engineering'}\n"
            f"Topic: {topic}\n"
            f"Target Question Count: {num_questions}\n"
        )
        if context:
            user_prompt += f"Grounding PYQ Context:\n{context}\n"

        user_prompt += (
            "\nRequirements:\n"
            "- Write clear, professional questions testing practical knowledge, trade-offs, architecture, and troubleshooting.\n"
            "- Avoid trivial filler questions.\n"
            "- Include realistic production considerations (e.g. high availability, security, cost, automation).\n"
            "- For system architecture, network topology, or CI/CD questions, optionally embed a clean Mermaid diagram (```mermaid ... ```) to test the candidate's analysis.\n"
        )

        result = self.llm_gateway.generate_json(system_prompt, user_prompt, temperature=0.7)
        if isinstance(result, list) and len(result) > 0:
            formatted = []
            for item in result:
                if isinstance(item, dict) and item.get("text"):
                    q_text = item["text"].strip()
                    if not q_text.endswith("?"):
                        q_text += "?"
                    formatted.append({
                        "text": q_text,
                        "marks": int(item.get("marks", 5)),
                        "difficulty": str(item.get("difficulty", "medium")).lower(),
                        "question_type": item.get("question_type", "descriptive"),
                        "topic": topic,
                        "source": f"AI Engine ({self.llm_gateway._provider})"
                    })
            if formatted:
                return formatted
        return None

    def generate_questions_with_pyq_patterns(
        self, subject: str, topic: str, num_questions: int = 3, grounding_context: str = ""
    ) -> list[dict]:
        """Generate questions using LLM with PYQ grounding, falling back to clean PYQ bank matches & domain templates."""
        # 1. Try LLM generation first
        if self.llm_gateway and self.llm_gateway.is_available():
            llm_questions = self._generate_questions_with_llm(subject, topic, num_questions, grounding_context)
            if llm_questions and len(llm_questions) >= num_questions:
                return llm_questions[:num_questions]

        questions = []
        try:
            # 2. Search authentic PYQs for this subject
            pyq_questions = get_pyq_questions_by_subject(subject, limit=60)
            topic_clean = re.sub(r"\(short answer\)|\(long answer\)", "", topic, flags=re.IGNORECASE).strip().lower()

            if pyq_questions:
                for pyq in pyq_questions:
                    pyq_text = pyq.get("text", "")
                    pyq_topic = pyq.get("topic", "").lower()

                    # Exact or strong word overlap with the topic
                    words = [w for w in topic_clean.split() if len(w) > 3]
                    is_match = (
                        topic_clean in pyq_topic or
                        topic_clean in pyq_text.lower() or
                        (words and sum(1 for w in words if w in pyq_text.lower()) >= len(words) * 0.6)
                    )

                    if is_match and len(pyq_text) > 15:
                        questions.append({
                            "text": pyq_text,
                            "marks": pyq.get("marks", 5),
                            "difficulty": pyq.get("difficulty", "medium"),
                            "question_type": pyq.get("question_type") or "descriptive",
                            "topic": topic,
                            "source": "PYQ Question Bank"
                        })
                        if len(questions) >= num_questions:
                            return questions[:num_questions]

            # 3. If authentic PYQs did not meet the count, fill with domain-calibrated templates
            short_mode = "short answer" in topic.lower()
            remaining = num_questions - len(questions)
            fallback_items = self._generate_fallback_questions_dict(topic, remaining, short_mode=short_mode)
            questions.extend(fallback_items)

        except Exception as e:
            logger.error("Question generation failed (%s). Using fallback templates.", e)
            return self._generate_fallback_questions_dict(topic, num_questions)

        return questions[:num_questions]

    def _generate_fallback_questions(self, topic: str, count: int) -> list[str]:
        clean_topic = re.sub(r"\(short answer\)|\(long answer\)", "", topic, flags=re.IGNORECASE).strip()
        templates = [
            f"Explain the architecture and core components of {clean_topic}.",
            f"How does {clean_topic} operate in high-availability cloud environments?",
            f"What are the essential configuration parameters and operational best practices for {clean_topic}?",
            f"Compare and contrast different implementation strategies for {clean_topic}.",
            f"Describe how to troubleshoot common production failure modes in {clean_topic}.",
            f"What security controls and least-privilege policies should be enforced for {clean_topic}?",
            f"Illustrate the workflow and lifecycle stages of {clean_topic} with an architecture diagram.",
            f"Explain the performance trade-offs and cost optimization strategies when implementing {clean_topic}."
        ]
        return templates[:count]

    def _generate_fallback_questions_dict(self, topic: str, count: int, short_mode: bool = False) -> list[dict]:
        clean_topic = re.sub(r"\(short answer\)|\(long answer\)", "", topic, flags=re.IGNORECASE).strip()
        if short_mode:
            stems = [
                (f"Define {clean_topic} and state its primary role in cloud infrastructure.", 2, "easy", "short"),
                (f"List two key differences between {clean_topic} and traditional on-premises alternatives.", 2, "easy", "short"),
                (f"Which command or API call is used to verify the operational health of {clean_topic}?", 2, "easy", "short"),
                (f"State the default port, protocol, and configuration file format used by {clean_topic}.", 2, "easy", "short"),
                (f"Briefly describe how automated failover works for {clean_topic}.", 2, "medium", "short")
            ]
        else:
            stems = [
                (f"Explain the architecture, lifecycle, and operational mechanics of {clean_topic} in enterprise deployments.", 10, "medium", "long"),
                (f"Design an end-to-end resilient architecture leveraging {clean_topic} across multiple Availability Zones.", 15, "hard", "long"),
                (f"Troubleshoot a scenario where {clean_topic} experiences sudden latency and connection timeouts. Outline root causes and diagnostic steps.", 10, "hard", "long"),
                (f"Compare the cost, security, and scalability trade-offs of {clean_topic} versus managed alternatives.", 8, "medium", "long"),
                (f"Provide the declarative configuration (YAML / HCL / Bash) required to provision and secure {clean_topic}.", 10, "medium", "long")
            ]

        results = []
        for text, marks, diff, q_type in stems[:count]:
            results.append({
                "text": text,
                "marks": marks,
                "difficulty": diff,
                "question_type": q_type,
                "topic": topic,
                "source": "Curated Domain Template"
            })
        return results

    def compute_similarity(self, text1: str, text2: str) -> float:
        self.load_models()
        if self._bert_model is None:
            words1 = set(text1.lower().split())
            words2 = set(text2.lower().split())
            if not words1 or not words2:
                return 0.0
            intersection = words1 & words2
            return len(intersection) / max(len(words1), len(words2))

        embeddings = self._bert_model.encode([text1, text2], convert_to_tensor=True)
        similarity = util.cos_sim(embeddings[0], embeddings[1])
        return float(similarity.item())

    def compute_batch_similarity(self, questions: list[str]) -> list[list[float]]:
        self.load_models()
        n = len(questions)
        similarity_matrix = [[0.0] * n for _ in range(n)]

        if self._bert_model is None:
            for i in range(n):
                for j in range(i + 1, n):
                    sim = self.compute_similarity(questions[i], questions[j])
                    similarity_matrix[i][j] = sim
                    similarity_matrix[j][i] = sim
            return similarity_matrix

        embeddings = self._bert_model.encode(questions, convert_to_tensor=True)
        sim_matrix = util.cos_sim(embeddings, embeddings)

        for i in range(n):
            for j in range(n):
                similarity_matrix[i][j] = float(sim_matrix[i][j].item())

        return similarity_matrix

    def classify_difficulty(self, question: str) -> str:
        question_lower = question.lower()
        hard_keywords = [
            "derive", "prove", "analyze", "design", "implement",
            "compare and contrast", "evaluate", "complexity",
            "optimize", "algorithm", "diagram", "troubleshoot", "multi-region"
        ]
        medium_keywords = [
            "explain", "describe", "discuss", "illustrate",
            "differentiate", "working", "principle", "applications", "lifecycle"
        ]

        for kw in hard_keywords:
            if kw in question_lower:
                return "hard"
        for kw in medium_keywords:
            if kw in question_lower:
                return "medium"
        return "easy"

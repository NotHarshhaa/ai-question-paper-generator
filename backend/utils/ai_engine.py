import logging
from transformers import T5ForConditionalGeneration, T5Tokenizer, pipeline
from sentence_transformers import SentenceTransformer, util
import torch
from database.db import get_pyq_questions_by_subject, get_pyq_questions_by_difficulty

logger = logging.getLogger(__name__)


class AIEngine:
    def __init__(self, t5_model_name: str, bert_model_name: str):
        self.t5_model_name = t5_model_name
        self.bert_model_name = bert_model_name
        self._t5_model = None
        self._t5_tokenizer = None
        self._bert_model = None
        self._loaded = False

    def load_models(self):
        if self._loaded:
            return
        logger.info("Loading T5 model: %s", self.t5_model_name)
        try:
            self._t5_tokenizer = T5Tokenizer.from_pretrained(self.t5_model_name)
            self._t5_model = T5ForConditionalGeneration.from_pretrained(
                self.t5_model_name
            )
            self._t5_model.eval()
            logger.info("T5 model loaded successfully")
        except Exception as e:
            logger.warning("Failed to load T5 model: %s. Using fallback.", e)
            self._t5_model = None
            self._t5_tokenizer = None

        logger.info("Loading BERT model: %s", self.bert_model_name)
        try:
            self._bert_model = SentenceTransformer(self.bert_model_name)
            logger.info("BERT model loaded successfully")
        except Exception as e:
            logger.warning("Failed to load BERT model: %s. Using fallback.", e)
            self._bert_model = None

        self._loaded = True

    def generate_questions(
        self, topic: str, context: str = "", num_questions: int = 3
    ) -> list[str]:
        self.load_models()
        questions = []

        if self._t5_model and self._t5_tokenizer:
            try:
                questions = self._generate_with_t5(topic, context, num_questions)
            except Exception as e:
                logger.warning("T5 generation failed: %s. Using fallback.", e)

        # Fallback: generate template-based questions
        if len(questions) < num_questions:
            fallback = self._generate_fallback_questions(topic, num_questions - len(questions))
            questions.extend(fallback)

        return questions[:num_questions]

    def _generate_with_t5(
        self, topic: str, context: str, num_questions: int
    ) -> list[str]:
        questions = []
        # Prepare input text with highlight tokens
        if context:
            input_text = f"generate question: {context} <hl> {topic} <hl>"
        else:
            input_text = f"generate question: {topic} is an important concept in computer science. <hl> {topic} <hl>"

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
            question = self._t5_tokenizer.decode(output, skip_special_tokens=True)
            question = question.strip()
            if question and not question.endswith("?"):
                question += "?"
            if question and len(question) > 10:
                questions.append(question)

        return questions

    def _generate_fallback_questions(
        self, topic: str, count: int
    ) -> list[str]:
        templates = [
            f"Explain the concept of {topic} in detail.",
            f"What are the key features and applications of {topic}?",
            f"Describe the working principle of {topic} with a suitable example.",
            f"Compare and contrast different approaches to {topic}.",
            f"Discuss the advantages and disadvantages of {topic}.",
            f"Write a short note on {topic}.",
            f"Explain {topic} with a neat diagram.",
            f"What is {topic}? Describe its significance in the field.",
            f"Illustrate the implementation of {topic} with an example.",
            f"Analyze the time and space complexity of {topic}.",
            f"How does {topic} differ from related concepts? Explain.",
            f"Derive and explain the algorithm for {topic}.",
        ]
        return templates[:count]

    def compute_similarity(self, text1: str, text2: str) -> float:
        self.load_models()
        if self._bert_model is None:
            # Simple fallback using word overlap
            words1 = set(text1.lower().split())
            words2 = set(text2.lower().split())
            if not words1 or not words2:
                return 0.0
            intersection = words1 & words2
            return len(intersection) / max(len(words1), len(words2))

        embeddings = self._bert_model.encode(
            [text1, text2], convert_to_tensor=True
        )
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
            "optimize", "algorithm", "diagram",
        ]
        medium_keywords = [
            "explain", "describe", "discuss", "illustrate",
            "differentiate", "working", "principle", "applications",
        ]

        for kw in hard_keywords:
            if kw in question_lower:
                return "hard"
        for kw in medium_keywords:
            if kw in question_lower:
                return "medium"
        return "easy"

    def generate_questions_with_pyq_patterns(
        self, subject: str, topic: str, num_questions: int = 3
    ) -> list[dict]:
        """Generate questions using PYQ patterns for the subject."""
        self.load_models()
        questions = []
        
        try:
            # Get PYQ questions for this subject
            pyq_questions = get_pyq_questions_by_subject(subject, limit=50)
            if not pyq_questions:
                logger.warning("No PYQ questions found for subject: %s", subject)
                return self._generate_fallback_questions_dict(topic, num_questions)
            
            # Filter questions related to the topic
            topic_lower = topic.lower()
            relevant_pyqs = []
            
            for pyq in pyq_questions:
                pyq_topic = pyq["topic"].lower()
                pyq_text = pyq["text"].lower()
                # Check if topic appears in PYQ text or topic
                if (topic_lower in pyq_topic or 
                    topic_lower in pyq_text or
                    any(word in pyq_topic for word in topic_lower.split() if len(word) > 3) or
                    any(word in pyq_text for word in topic_lower.split() if len(word) > 3)):
                    relevant_pyqs.append(pyq)
            
            # If no relevant PYQs, use general PYQs as patterns
            if not relevant_pyqs:
                relevant_pyqs = pyq_questions[:10]
            
            # Generate new questions based on PYQ patterns
            for pyq in relevant_pyqs[:num_questions]:
                # Use PYQ as template and replace the topic
                template = pyq["text"]
                new_question = self._adapt_pyq_template(template, topic)
                
                if new_question and len(new_question) > 20:
                    questions.append({
                        "text": new_question,
                        "marks": pyq["marks"],
                        "difficulty": pyq["difficulty"],
                        "question_type": pyq["question_type"],
                        "topic": topic,
                        "source": "PYQ Pattern"
                    })
            
            # If we didn't get enough questions, use T5 fallback
            if len(questions) < num_questions:
                t5_questions = self.generate_questions(topic, "", num_questions - len(questions))
                for q_text in t5_questions:
                    questions.append({
                        "text": q_text,
                        "marks": 5,
                        "difficulty": self.classify_difficulty(q_text),
                        "question_type": "descriptive",
                        "topic": topic,
                        "source": "T5 Generated"
                    })
                    
        except Exception as e:
            logger.error("PYQ pattern generation failed: %s", e)
            return self._generate_fallback_questions_dict(topic, num_questions)
        
        return questions[:num_questions]
    
    def _adapt_pyq_template(self, template: str, new_topic: str) -> str:
        """Adapt a PYQ template to use the new topic."""
        # Extract the main concept from the template
        import re
        
        # Common patterns to replace
        replacements = [
            (r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b', new_topic),  # Proper nouns
            (r'\b[A-Z][a-z]+\b', new_topic),  # Single proper noun
            (r'\bdata\s+structures?\b', new_topic, re.IGNORECASE),
            (r'\balgorithms?\b', new_topic, re.IGNORECASE),
            (r'\bsearch\s+algorithms?\b', new_topic, re.IGNORECASE),
            (r'\bsort\s+algorithms?\b', new_topic, re.IGNORECASE),
            (r'\bbinary\s+tree\b', new_topic, re.IGNORECASE),
            (r'\barray\b', new_topic, re.IGNORECASE),
            (r'\bstack\b', new_topic, re.IGNORECASE),
            (r'\bqueue\b', new_topic, re.IGNORECASE),
        ]
        
        adapted = template
        for pattern in replacements:
            if isinstance(pattern, tuple) and len(pattern) == 3:
                adapted = re.sub(pattern[0], pattern[1], adapted, flags=pattern[2])
            else:
                adapted = re.sub(pattern[0], pattern[1], adapted, flags=re.IGNORECASE)
        
        # Clean up common OCR artifacts
        adapted = re.sub(r'\s+', ' ', adapted)
        adapted = re.sub(r'\d+$', '', adapted)  # Remove trailing question numbers
        adapted = adapted.strip()
        
        return adapted
    
    def _generate_fallback_questions_dict(self, topic: str, count: int) -> list[dict]:
        """Generate fallback questions when other methods fail."""
        templates = [
            f"Explain the concept of {topic}.",
            f"Describe the applications of {topic}.",
            f"Discuss the importance of {topic} in computer science.",
            f"What are the advantages of {topic}?",
            f"Compare and contrast {topic} with related concepts.",
        ]
        
        questions = []
        for i, template in enumerate(templates[:count]):
            questions.append({
                "text": template,
                "marks": 5,
                "difficulty": "medium",
                "question_type": "descriptive",
                "topic": topic,
                "source": "Template Fallback"
            })
        
        return questions

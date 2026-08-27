import logging
import numpy as np
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class VectorRAGEngine:
    """
    In-memory Vector Retrieval-Augmented Generation (RAG) Grounding Engine.
    Embeds the PYQ question bank and provides fast cosine similarity vector search
    to ground question generation and MCQ distractor generation.
    """

    def __init__(self, ai_engine=None):
        self.ai_engine = ai_engine
        self.documents: List[Dict[str, Any]] = []
        self.embeddings: Optional[np.ndarray] = None
        self._initialized = False

    def build_index(self, pyq_questions: List[Dict[str, Any]]):
        """Build the in-memory vector index from a list of PYQ records."""
        if not pyq_questions:
            return

        self.documents = pyq_questions
        texts = [
            f"{q.get('subject', '')} {q.get('topic', '')}: {q.get('text', '')} {q.get('answer', '')[:100]}"
            for q in pyq_questions
        ]

        logger.info("Indexing %d PYQ documents in Vector RAG Engine...", len(texts))

        # Try computing embeddings via SentenceTransformers
        if self.ai_engine and hasattr(self.ai_engine, "_bert_model") and self.ai_engine._bert_model:
            try:
                emb = self.ai_engine._bert_model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
                self.embeddings = emb
                self._initialized = True
                logger.info("Vector RAG index built with Sentence-BERT embeddings (dim=%s)", self.embeddings.shape)
                return
            except Exception as e:
                logger.warning("BERT embedding indexing failed (%s). Using TF-IDF fallback.", e)

        # Fallback: TF-IDF vectorizer
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            self._tfidf = TfidfVectorizer(stop_words="english", max_features=3000)
            self.embeddings = self._tfidf.fit_transform(texts).toarray()
            # Normalize vectors
            norms = np.linalg.norm(self.embeddings, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            self.embeddings = self.embeddings / norms
            self._initialized = True
            logger.info("Vector RAG index built with TF-IDF fallback (dim=%s)", self.embeddings.shape)
        except Exception as e:
            logger.error("Failed to build Vector RAG index: %s", e)

    def search(
        self,
        query: str,
        top_k: int = 5,
        subject: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Perform cosine similarity search across indexed documents."""
        if not self._initialized or self.embeddings is None or not self.documents:
            return []

        # Encode query
        query_vec = None
        if self.ai_engine and hasattr(self.ai_engine, "_bert_model") and self.ai_engine._bert_model:
            try:
                query_vec = self.ai_engine._bert_model.encode([query], convert_to_numpy=True, normalize_embeddings=True)[0]
            except Exception:
                query_vec = None

        if query_vec is None and hasattr(self, "_tfidf"):
            try:
                query_vec = self._tfidf.transform([query]).toarray()[0]
                norm = np.linalg.norm(query_vec)
                if norm > 0:
                    query_vec = query_vec / norm
            except Exception:
                query_vec = None

        if query_vec is None:
            return []

        # Compute cosine similarity
        scores = np.dot(self.embeddings, query_vec)

        # Filter by subject if specified
        results = []
        indexed_indices = list(range(len(self.documents)))

        if subject and subject.strip() and subject.lower() != "all":
            subj_lower = subject.lower()
            indexed_indices = [
                i for i in indexed_indices
                if subj_lower in self.documents[i].get("subject", "").lower()
            ]

        if not indexed_indices:
            indexed_indices = list(range(len(self.documents)))

        top_indices = sorted(indexed_indices, key=lambda idx: scores[idx], reverse=True)[:top_k]

        for idx in top_indices:
            doc = dict(self.documents[idx])
            doc["similarity_score"] = float(round(scores[idx], 4))
            results.append(doc)

        return results

    def get_grounding_context(self, topic: str, subject: str = "", top_k: int = 3) -> str:
        """Retrieve relevant PYQ excerpts to ground question generation."""
        matches = self.search(f"{subject} {topic}", top_k=top_k, subject=subject)
        if not matches:
            return ""

        context_snippets = []
        for m in matches:
            text = m.get("text", "")
            ans = m.get("answer", "")
            if ans:
                context_snippets.append(f"Q: {text} | Key Concept: {ans[:150]}")
            else:
                context_snippets.append(f"Related Topic: {text}")

        return " \n".join(context_snippets)

# =============================================================================
# backend/utils/rag_engine.py — Hybrid Vector + BM25 RAG Grounding Engine
# =============================================================================
import os
import re
import math
import logging
import numpy as np
from typing import List, Dict, Any, Optional
from collections import Counter, defaultdict

from config import BASE_DIR

logger = logging.getLogger(__name__)

CACHE_DIR = os.path.join(BASE_DIR, ".cache")
EMBEDDINGS_CACHE_FILE = os.path.join(CACHE_DIR, "rag_embeddings.npz")


class BM25Ranker:
    """
    In-memory Okapi BM25 Lexical Keyword Ranker.
    Optimized for technical keywords, CLI commands, and exact DevOps terminology
    (e.g., 'kubectl rollout undo', 'aws sts assume-role', 'terraform state rm').
    """

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.doc_len: List[int] = []
        self.avgdl: float = 0.0
        self.corpus_size: int = 0
        self.idf: Dict[str, float] = {}
        self.doc_freqs: List[Counter] = []
        self._token_pattern = re.compile(r"[A-Za-z0-9_\-\.:/]+")

    def tokenize(self, text: str) -> List[str]:
        """Tokenize preserving technical syntax, dashes, and path separators."""
        return [t.lower() for t in self._token_pattern.findall(text) if len(t) > 1]

    def fit(self, corpus: List[str]):
        """Index the corpus and calculate document frequencies and IDFs."""
        self.corpus_size = len(corpus)
        if self.corpus_size == 0:
            return

        self.doc_len = []
        self.doc_freqs = []
        df = defaultdict(int)

        total_len = 0
        for doc in corpus:
            tokens = self.tokenize(doc)
            length = len(tokens)
            self.doc_len.append(length)
            total_len += length
            freqs = Counter(tokens)
            self.doc_freqs.append(freqs)
            for term in freqs:
                df[term] += 1

        self.avgdl = total_len / self.corpus_size if self.corpus_size > 0 else 0.0

        # Calculate Okapi BM25 IDF
        self.idf = {}
        for term, freq in df.items():
            # Standard smoothed BM25 IDF
            self.idf[term] = math.log(1.0 + (self.corpus_size - freq + 0.5) / (freq + 0.5))

    def score(self, query: str) -> np.ndarray:
        """Compute BM25 scores for all documents given a query string."""
        scores = np.zeros(self.corpus_size, dtype=np.float32)
        if self.corpus_size == 0 or not self.idf:
            return scores

        query_tokens = self.tokenize(query)
        if not query_tokens:
            return scores

        for token in query_tokens:
            if token not in self.idf:
                continue
            idf_val = self.idf[token]
            for doc_idx, freqs in enumerate(self.doc_freqs):
                if token not in freqs:
                    continue
                tf = freqs[token]
                doc_len = self.doc_len[doc_idx]
                denom = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / self.avgdl))
                if denom > 0:
                    scores[doc_idx] += idf_val * (tf * (self.k1 + 1.0) / denom)

        return scores


class VectorRAGEngine:
    """
    Hybrid RAG Engine combining:
    1. Dense Vector Embeddings (Sentence-BERT / all-MiniLM-L6-v2) for semantic comprehension
    2. BM25 Lexical Keyword Ranking for exact CLI commands and technical identifiers
    3. Reciprocal Rank Fusion (RRF) for optimal balanced retrieval
    4. On-Disk Caching for instant startup (<100ms vs 45s)
    """

    def __init__(self, ai_engine=None):
        self.ai_engine = ai_engine
        self.documents: List[Dict[str, Any]] = []
        self.embeddings: Optional[np.ndarray] = None
        self.bm25 = BM25Ranker()
        self._initialized = False

    def build_index(self, pyq_questions: List[Dict[str, Any]]):
        """Build hybrid index with automatic persistent caching."""
        if not pyq_questions:
            return

        self.documents = pyq_questions
        texts = [
            f"{q.get('subject', '')} {q.get('topic', '')}: {q.get('text', '')} {q.get('answer', '')[:120]}"
            for q in pyq_questions
        ]

        logger.info("Initializing Hybrid RAG Engine for %d documents...", len(texts))

        # 1. Build BM25 Index
        self.bm25.fit(texts)

        # 2. Check On-Disk Embedding Cache
        os.makedirs(CACHE_DIR, exist_ok=True)
        if os.path.exists(EMBEDDINGS_CACHE_FILE):
            try:
                cached_data = np.load(EMBEDDINGS_CACHE_FILE)
                cached_embeddings = cached_data["embeddings"]
                if cached_embeddings.shape[0] == len(texts):
                    self.embeddings = cached_embeddings
                    self._initialized = True
                    logger.info("⚡ Loaded %d cached vector embeddings from %s (<100ms startup)",
                                len(texts), EMBEDDINGS_CACHE_FILE)
                    return
                else:
                    logger.info("Cached embeddings count (%d) differs from document count (%d). Recomputing...",
                                cached_embeddings.shape[0], len(texts))
            except Exception as cache_err:
                logger.warning("Could not load cached embeddings: %s", cache_err)

        # 3. Compute Dense Embeddings (Sentence-BERT)
        if self.ai_engine and hasattr(self.ai_engine, "_bert_model") and self.ai_engine._bert_model:
            try:
                emb = self.ai_engine._bert_model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
                self.embeddings = emb
                self._initialized = True
                # Persist to disk
                np.savez_compressed(EMBEDDINGS_CACHE_FILE, embeddings=self.embeddings)
                logger.info("Built and cached Dense embeddings (dim=%s) at %s", self.embeddings.shape, EMBEDDINGS_CACHE_FILE)
                return
            except Exception as e:
                logger.warning("BERT embedding computation failed (%s). Falling back to TF-IDF.", e)

        # 4. Fallback: TF-IDF vectorizer
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            self._tfidf = TfidfVectorizer(stop_words="english", max_features=3000)
            self.embeddings = self._tfidf.fit_transform(texts).toarray()
            norms = np.linalg.norm(self.embeddings, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            self.embeddings = self.embeddings / norms
            self._initialized = True
            logger.info("Hybrid RAG initialized with TF-IDF fallback (dim=%s)", self.embeddings.shape)
        except Exception as e:
            logger.error("Failed to build dense embeddings: %s", e)
            self._initialized = True  # BM25 is still active!

    def search(
        self,
        query: str,
        top_k: int = 5,
        subject: Optional[str] = None,
        dense_weight: float = 0.6,
        bm25_weight: float = 0.4,
    ) -> List[Dict[str, Any]]:
        """
        Hybrid search combining Dense Cosine Similarity and BM25 Lexical Ranking
        using Reciprocal Rank Fusion (RRF).
        """
        if not self.documents:
            return []

        doc_count = len(self.documents)
        indexed_indices = list(range(doc_count))

        # Filter indices by subject if specified
        if subject and subject.strip() and subject.lower() != "all":
            subj_lower = subject.lower()
            filtered = [
                i for i in indexed_indices
                if subj_lower in self.documents[i].get("subject", "").lower()
            ]
            if filtered:
                indexed_indices = filtered

        # 1. Compute BM25 scores
        bm25_scores = self.bm25.score(query)

        # 2. Compute Dense vector scores
        dense_scores = np.zeros(doc_count, dtype=np.float32)
        if self._initialized and self.embeddings is not None:
            query_vec = None
            if self.ai_engine and hasattr(self.ai_engine, "_bert_model") and self.ai_engine._bert_model:
                try:
                    query_vec = self.ai_engine._bert_model.encode([query], convert_to_numpy=True, normalize_embeddings=True)[0]
                except Exception:
                    query_vec = None
            elif hasattr(self, "_tfidf"):
                try:
                    query_vec = self._tfidf.transform([query]).toarray()[0]
                    norm = np.linalg.norm(query_vec)
                    if norm > 0:
                        query_vec = query_vec / norm
                except Exception:
                    query_vec = None

            if query_vec is not None:
                dense_scores = np.dot(self.embeddings, query_vec)

        # 3. Reciprocal Rank Fusion (RRF)
        # RRF formula: Score(d) = sum(weight / (k + rank(d))) with k = 60
        k_const = 60.0
        rrf_scores = defaultdict(float)

        # Dense ranking
        dense_ranked = sorted(indexed_indices, key=lambda i: dense_scores[i], reverse=True)
        for rank, doc_idx in enumerate(dense_ranked):
            rrf_scores[doc_idx] += dense_weight / (k_const + rank + 1)

        # BM25 ranking
        bm25_ranked = sorted(indexed_indices, key=lambda i: bm25_scores[i], reverse=True)
        for rank, doc_idx in enumerate(bm25_ranked):
            rrf_scores[doc_idx] += bm25_weight / (k_const + rank + 1)

        # Sort by final fused RRF score
        top_indices = sorted(indexed_indices, key=lambda i: rrf_scores[i], reverse=True)[:top_k]

        results = []
        for idx in top_indices:
            doc = dict(self.documents[idx])
            doc["similarity_score"] = float(round(float(dense_scores[idx]), 4))
            doc["bm25_score"] = float(round(float(bm25_scores[idx]), 4))
            doc["rrf_score"] = float(round(float(rrf_scores[idx]), 6))
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

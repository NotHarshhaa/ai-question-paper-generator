import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer

# Download required NLTK data
nltk.download("punkt", quiet=True)
nltk.download("punkt_tab", quiet=True)
nltk.download("stopwords", quiet=True)


class NLPProcessor:
    def __init__(self):
        self.stop_words = set(stopwords.words("english"))
        self.tfidf_vectorizer = TfidfVectorizer(
            stop_words="english", max_features=100, ngram_range=(1, 2)
        )

    def tokenize(self, text: str) -> list[str]:
        tokens = word_tokenize(text.lower())
        return [t for t in tokens if t.isalnum() and t not in self.stop_words]

    def extract_sentences(self, text: str) -> list[str]:
        return sent_tokenize(text)

    def extract_topics(self, syllabus: str) -> list[str]:
        lines = syllabus.strip().split("\n")
        topics = []

        for line in lines:
            line = line.strip()
            if not line:
                continue
            # Remove unit headers like "Unit 1:", "UNIT-I:", etc.
            cleaned = re.sub(
                r"^(unit[\s\-]*[\divxlc]+[\s:.\-]*)", "", line, flags=re.IGNORECASE
            ).strip()
            if not cleaned:
                continue
            # Remove bullet points, dashes, numbers at start
            cleaned = re.sub(r"^[\-\*\d\.\)\s]+", "", cleaned).strip()
            if not cleaned:
                continue
            # Split by commas for sub-topics
            sub_topics = [t.strip() for t in cleaned.split(",")]
            for st in sub_topics:
                st = st.strip(" -•*")
                if len(st) > 2:
                    topics.append(st)

        return list(dict.fromkeys(topics))  # Remove duplicates, preserve order

    def extract_units(self, syllabus: str) -> list[str]:
        lines = syllabus.strip().split("\n")
        units = []

        for line in lines:
            line = line.strip()
            match = re.match(
                r"^(unit[\s\-]*[\divxlc]+)[\s:.\-]*(.*)",
                line,
                flags=re.IGNORECASE,
            )
            if match:
                unit_name = match.group(1).strip()
                unit_title = match.group(2).strip()
                if unit_title:
                    units.append(f"{unit_name}: {unit_title}")
                else:
                    units.append(unit_name)

        if not units:
            units = ["Unit 1"]

        return units

    def get_important_topics(self, syllabus: str, top_n: int = 20) -> list[str]:
        topics = self.extract_topics(syllabus)
        if not topics:
            return []

        try:
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(topics)
            feature_names = self.tfidf_vectorizer.get_feature_names_out()

            # Get average TF-IDF score for each topic
            scores = tfidf_matrix.sum(axis=1).A1
            scored_topics = list(zip(topics, scores))
            scored_topics.sort(key=lambda x: x[1], reverse=True)

            return [t[0] for t in scored_topics[:top_n]]
        except Exception:
            return topics[:top_n]

    def map_topics_to_units(
        self, syllabus: str
    ) -> dict[str, list[str]]:
        lines = syllabus.strip().split("\n")
        unit_map: dict[str, list[str]] = {}
        current_unit = "Unit 1"

        for line in lines:
            line = line.strip()
            if not line:
                continue

            match = re.match(
                r"^(unit[\s\-]*[\divxlc]+)", line, flags=re.IGNORECASE
            )
            if match:
                current_unit = match.group(1).strip()
                if current_unit not in unit_map:
                    unit_map[current_unit] = []
                continue

            cleaned = re.sub(r"^[\-\*\d\.\)\s]+", "", line).strip()
            if cleaned and len(cleaned) > 2:
                if current_unit not in unit_map:
                    unit_map[current_unit] = []
                sub_topics = [t.strip(" -•*") for t in cleaned.split(",")]
                for st in sub_topics:
                    if len(st) > 2:
                        unit_map[current_unit].append(st)

        return unit_map

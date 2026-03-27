import logging
import math

logger = logging.getLogger(__name__)


class PaperStructurer:
    def structure_standard(
        self, questions: list[dict], total_marks: int
    ) -> list[dict]:
        n = len(questions)
        if n == 0:
            return []

        marks_per_q = total_marks // n
        remainder = total_marks % n

        for i, q in enumerate(questions):
            q["marks"] = marks_per_q + (1 if i < remainder else 0)

        return [
            {
                "name": "Section A — Answer All Questions",
                "instructions": f"Answer all {n} questions. Each question carries the marks indicated.",
                "questions": questions,
                "total_marks": total_marks,
            }
        ]

    def structure_sections(
        self, questions: list[dict], total_marks: int
    ) -> list[dict]:
        n = len(questions)
        if n == 0:
            return []

        # Split into 3 sections: A (short), B (medium), C (long)
        section_a_count = max(1, n // 3)
        section_b_count = max(1, n // 3)
        section_c_count = max(1, n - section_a_count - section_b_count)

        # Sort by difficulty for section assignment
        easy = [q for q in questions if q.get("difficulty") == "easy"]
        medium = [q for q in questions if q.get("difficulty") == "medium"]
        hard = [q for q in questions if q.get("difficulty") == "hard"]

        all_sorted = easy + medium + hard

        section_a_qs = all_sorted[:section_a_count]
        section_b_qs = all_sorted[section_a_count : section_a_count + section_b_count]
        section_c_qs = all_sorted[section_a_count + section_b_count :]

        # Distribute marks: A=20%, B=30%, C=50%
        marks_a = max(section_a_count, round(total_marks * 0.2))
        marks_b = max(section_b_count, round(total_marks * 0.3))
        marks_c = total_marks - marks_a - marks_b

        self._assign_marks(section_a_qs, marks_a)
        self._assign_marks(section_b_qs, marks_b)
        self._assign_marks(section_c_qs, marks_c)

        sections = []
        if section_a_qs:
            sections.append(
                {
                    "name": "Section A — Short Answer Questions",
                    "instructions": f"Answer all questions. ({marks_a} marks)",
                    "questions": section_a_qs,
                    "total_marks": marks_a,
                }
            )
        if section_b_qs:
            sections.append(
                {
                    "name": "Section B — Descriptive Questions",
                    "instructions": f"Answer all questions. ({marks_b} marks)",
                    "questions": section_b_qs,
                    "total_marks": marks_b,
                }
            )
        if section_c_qs:
            sections.append(
                {
                    "name": "Section C — Long Answer Questions",
                    "instructions": f"Answer all questions. ({marks_c} marks)",
                    "questions": section_c_qs,
                    "total_marks": marks_c,
                }
            )

        return sections

    def structure_with_choice(
        self, questions: list[dict], total_marks: int
    ) -> list[dict]:
        n = len(questions)
        if n == 0:
            return []

        marks_per_q = total_marks // max(1, n // 2) if n > 1 else total_marks
        remainder = total_marks - marks_per_q * (n // 2) if n > 1 else 0

        for i, q in enumerate(questions):
            q["marks"] = marks_per_q + (1 if i == 0 and remainder > 0 else 0)

        return [
            {
                "name": "Section A — Answer Any Questions (Internal Choice)",
                "instructions": f"Answer any {math.ceil(n / 2)} out of {n} questions. Each question carries {marks_per_q} marks.",
                "questions": questions,
                "total_marks": total_marks,
            }
        ]

    def structure_paper(
        self, questions: list[dict], exam_pattern: str, total_marks: int
    ) -> list[dict]:
        if exam_pattern == "sections":
            return self.structure_sections(questions, total_marks)
        elif exam_pattern == "choice":
            return self.structure_with_choice(questions, total_marks)
        else:
            return self.structure_standard(questions, total_marks)

    def _assign_marks(self, questions: list[dict], total_marks: int):
        n = len(questions)
        if n == 0:
            return
        per_q = total_marks // n
        remainder = total_marks % n
        for i, q in enumerate(questions):
            q["marks"] = per_q + (1 if i < remainder else 0)

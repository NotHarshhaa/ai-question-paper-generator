import os
import logging
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.lib.colors import black, gray, HexColor
from config import PDF_OUTPUT_DIR

logger = logging.getLogger(__name__)


class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._add_custom_styles()

    def _add_custom_styles(self):
        self.styles.add(
            ParagraphStyle(
                "UniversityName",
                parent=self.styles["Title"],
                fontSize=16,
                alignment=TA_CENTER,
                spaceAfter=4,
                fontName="Helvetica-Bold",
            )
        )
        self.styles.add(
            ParagraphStyle(
                "SubjectName",
                parent=self.styles["Heading2"],
                fontSize=13,
                alignment=TA_CENTER,
                spaceAfter=2,
            )
        )
        self.styles.add(
            ParagraphStyle(
                "PaperInfo",
                parent=self.styles["Normal"],
                fontSize=10,
                alignment=TA_CENTER,
                textColor=gray,
                spaceAfter=8,
            )
        )
        self.styles.add(
            ParagraphStyle(
                "SectionHeader",
                parent=self.styles["Heading3"],
                fontSize=12,
                spaceBefore=16,
                spaceAfter=4,
                fontName="Helvetica-Bold",
                textColor=HexColor("#1a1a1a"),
            )
        )
        self.styles.add(
            ParagraphStyle(
                "SectionInstructions",
                parent=self.styles["Italic"],
                fontSize=9,
                spaceAfter=8,
                textColor=gray,
            )
        )
        self.styles.add(
            ParagraphStyle(
                "QuestionText",
                parent=self.styles["Normal"],
                fontSize=10,
                spaceAfter=2,
                leading=14,
            )
        )
        self.styles.add(
            ParagraphStyle(
                "QuestionMarks",
                parent=self.styles["Normal"],
                fontSize=9,
                alignment=TA_RIGHT,
                textColor=gray,
            )
        )

    def generate_pdf(self, paper: dict) -> str:
        filename = f"{paper['id']}.pdf"
        filepath = os.path.join(PDF_OUTPUT_DIR, filename)

        doc = SimpleDocTemplate(
            filepath,
            pagesize=A4,
            leftMargin=2 * cm,
            rightMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )

        elements = []

        # Header
        if paper.get("university_name"):
            elements.append(
                Paragraph(paper["university_name"], self.styles["UniversityName"])
            )

        elements.append(
            Paragraph(paper["subject"], self.styles["SubjectName"])
        )

        if paper.get("semester"):
            elements.append(
                Paragraph(paper["semester"], self.styles["PaperInfo"])
            )

        info_text = f"Total Marks: {paper['total_marks']}  |  Duration: {paper['duration_minutes']} minutes"
        elements.append(Paragraph(info_text, self.styles["PaperInfo"]))

        elements.append(
            HRFlowable(
                width="100%", thickness=1, color=HexColor("#cccccc"), spaceAfter=12
            )
        )

        # Instructions
        elements.append(
            Paragraph(
                "<b>General Instructions:</b>",
                self.styles["Normal"],
            )
        )
        elements.append(
            Paragraph(
                "1. Read all questions carefully before answering.<br/>"
                "2. Write neat and legible answers.<br/>"
                "3. Figures/diagrams must be drawn wherever necessary.",
                self.styles["Normal"],
            )
        )
        elements.append(Spacer(1, 12))

        # Sections and questions
        for section in paper.get("sections", []):
            elements.append(
                Paragraph(section["name"], self.styles["SectionHeader"])
            )
            if section.get("instructions"):
                elements.append(
                    Paragraph(
                        section["instructions"], self.styles["SectionInstructions"]
                    )
                )

            for idx, q in enumerate(section.get("questions", []), 1):
                q_text = f"<b>Q{idx}.</b> {q['text']}"
                marks_text = f"[{q.get('marks', '')} marks]"

                # Build question as a table row for alignment
                q_para = Paragraph(q_text, self.styles["QuestionText"])
                m_para = Paragraph(marks_text, self.styles["QuestionMarks"])

                table_data = [[q_para, m_para]]
                table = Table(
                    table_data,
                    colWidths=[doc.width - 3 * cm, 2.5 * cm],
                )
                table.setStyle(
                    TableStyle(
                        [
                            ("VALIGN", (0, 0), (-1, -1), "TOP"),
                            ("TOPPADDING", (0, 0), (-1, -1), 4),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                        ]
                    )
                )
                elements.append(table)

            elements.append(Spacer(1, 8))

        # Footer
        elements.append(
            HRFlowable(
                width="100%", thickness=0.5, color=HexColor("#cccccc"), spaceBefore=20
            )
        )
        elements.append(
            Paragraph(
                "*** End of Question Paper ***",
                ParagraphStyle(
                    "EndText",
                    parent=self.styles["Normal"],
                    fontSize=10,
                    alignment=TA_CENTER,
                    textColor=gray,
                    spaceBefore=8,
                ),
            )
        )

        doc.build(elements)
        logger.info("PDF generated: %s", filepath)
        return filepath

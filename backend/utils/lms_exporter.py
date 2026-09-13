# =============================================================================
# backend/utils/lms_exporter.py — Multi-Format LMS Exporter Engine
# =============================================================================
import io
import json
import logging
from xml.sax.saxutils import escape as xml_escape
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


def _sanitize_xml(text: str) -> str:
    """Safely escape XML characters while preserving line breaks."""
    if not text:
        return ""
    return xml_escape(str(text))


# ── 1. Moodle XML Exporter ───────────────────────────────────────────────────
def export_to_moodle_xml(paper: Dict[str, Any]) -> str:
    """
    Exports question paper to Moodle XML format.
    Compatible with Moodle 3.x, 4.x, and Totara LMS.
    """
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', "<quiz>"]

    # Category question
    subject = _sanitize_xml(paper.get("subject", "DevOps & Cloud Engineering"))
    lines.append("  <question type=\"category\">")
    lines.append(f"    <category><text>$course$/{subject}</text></category>")
    lines.append("  </question>")

    # Add questions from sections or flat questions
    sections = paper.get("sections", [])
    questions_to_export = []
    if sections:
        for sec in sections:
            for q in sec.get("questions", []):
                questions_to_export.append(q)
    else:
        questions_to_export = paper.get("questions", [])

    for idx, q in enumerate(questions_to_export, 1):
        q_text = _sanitize_xml(q.get("text", ""))
        marks = q.get("marks", 2)
        bloom = _sanitize_xml(q.get("bloom_level", "Apply"))
        options = q.get("options", [])
        correct_answer = q.get("answer", "")

        if options and len(options) >= 2:
            # Multiple Choice Question
            lines.append("  <question type=\"multichoice\">")
            lines.append(f"    <name><text>Q{idx} - {bloom}</text></name>")
            lines.append(f"    <questiontext format=\"html\"><text><![CDATA[<p>{q_text}</p>]]></text></questiontext>")
            lines.append(f"    <defaultgrade>{marks}</defaultgrade>")
            lines.append("    <single>true</single>")
            lines.append("    <shuffleanswers>true</shuffleanswers>")
            lines.append("    <answernumbering>abc</answernumbering>")

            for opt in options:
                opt_str = str(opt).strip()
                is_correct = (opt_str.lower() == str(correct_answer).lower()) or (
                    len(opt_str) > 2 and opt_str[0].upper() == str(correct_answer).strip()[:1].upper()
                )
                fraction = "100" if is_correct else "0"
                feedback = "Correct! Well done." if is_correct else "Incorrect."
                lines.append(f"    <answer fraction=\"{fraction}\" format=\"html\">")
                lines.append(f"      <text><![CDATA[<p>{_sanitize_xml(opt_str)}</p>]]></text>")
                lines.append(f"      <feedback format=\"html\"><text><![CDATA[<p>{feedback}</p>]]></text></feedback>")
                lines.append("    </answer>")

            lines.append("  </question>")
        else:
            # Essay / Descriptive Question
            lines.append("  <question type=\"essay\">")
            lines.append(f"    <name><text>Q{idx} - {bloom}</text></name>")
            lines.append(f"    <questiontext format=\"html\"><text><![CDATA[<p>{q_text}</p>]]></text></questiontext>")
            lines.append(f"    <defaultgrade>{marks}</defaultgrade>")
            lines.append("    <responseformat>editor</responseformat>")
            lines.append("    <responserequired>1</responserequired>")
            if correct_answer:
                ans_clean = _sanitize_xml(correct_answer)
                lines.append(f"    <generalfeedback format=\"html\"><text><![CDATA[<p><strong>Model Answer / Rubric:</strong><br/>{ans_clean}</p>]]></text></generalfeedback>")
            lines.append("  </question>")

    lines.append("</quiz>")
    return "\n".join(lines)


# ── 2. Canvas / Blackboard IMS QTI 2.1 Exporter ──────────────────────────────
def export_to_qti_21(paper: Dict[str, Any]) -> str:
    """
    Exports to IMS Question and Test Interoperability (QTI) 2.1 XML specification.
    Natively importable into Canvas LMS, Blackboard Learn, and Brightspace D2L.
    """
    title = _sanitize_xml(f"{paper.get('subject', 'Exam')} - {paper.get('organization_name', 'Examination')}")
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<questestinterop xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
        f'  <assessment ident="assessment_{paper.get("id", "1")}" title="{title}">',
        '    <qtimetadata>',
        '      <qtimetadatafield>',
        '        <fieldlabel>qmd_timelimit</fieldlabel>',
        f'        <fieldentry>{paper.get("duration_minutes", 180)}</fieldentry>',
        '      </qtimetadatafield>',
        '    </qtimetadata>',
        '    <section ident="root_section">',
    ]

    sections = paper.get("sections", [])
    questions_to_export = []
    if sections:
        for sec in sections:
            for q in sec.get("questions", []):
                questions_to_export.append(q)
    else:
        questions_to_export = paper.get("questions", [])

    for idx, q in enumerate(questions_to_export, 1):
        q_ident = f"item_{idx}"
        q_text = _sanitize_xml(q.get("text", ""))
        marks = q.get("marks", 2)
        bloom = _sanitize_xml(q.get("bloom_level", "Understand"))
        options = q.get("options", [])
        correct_answer = str(q.get("answer", "")).strip()

        lines.append(f'      <item ident="{q_ident}" title="Q{idx} ({bloom})">')
        lines.append("        <itemmetadata>")
        lines.append("          <qtimetadata>")
        lines.append("            <qtimetadatafield><fieldlabel>bloom_taxonomy</fieldlabel>")
        lines.append(f"              <fieldentry>{bloom}</fieldentry></qtimetadatafield>")
        lines.append("            <qtimetadatafield><fieldlabel>points_possible</fieldlabel>")
        lines.append(f"              <fieldentry>{marks}</fieldentry></qtimetadatafield>")
        lines.append("          </qtimetadata>")
        lines.append("        </itemmetadata>")

        if options and len(options) >= 2:
            # Multiple Choice (response_lid)
            lines.append("        <presentation>")
            lines.append("          <material>")
            lines.append(f"            <mattext texttype=\"text/html\"><![CDATA[{q_text}]]></mattext>")
            lines.append("          </material>")
            lines.append(f'          <response_lid ident="response_{idx}" rcardinality="Single">')
            lines.append("            <render_choice>")

            correct_ident = "opt_0"
            for opt_idx, opt in enumerate(options):
                opt_ident = f"opt_{opt_idx}"
                opt_str = str(opt).strip()
                if (opt_str.lower() == correct_answer.lower()) or (
                    len(opt_str) > 2 and opt_str[0].upper() == correct_answer[:1].upper()
                ):
                    correct_ident = opt_ident

                lines.append(f'              <response_label ident="{opt_ident}">')
                lines.append("                <material>")
                lines.append(f"                  <mattext texttype=\"text/plain\">{_sanitize_xml(opt_str)}</mattext>")
                lines.append("                </material>")
                lines.append("              </response_label>")

            lines.append("            </render_choice>")
            lines.append("          </response_lid>")
            lines.append("        </presentation>")

            # Response processing
            lines.append("        <resprocessing>")
            lines.append("          <outcomes><decvar varname=\"SCORE\" vartype=\"Decimal\"/></outcomes>")
            lines.append("          <respcondition continue=\"No\">")
            lines.append("            <conditionvar>")
            lines.append(f'              <varequal respident="response_{idx}">{correct_ident}</varequal>')
            lines.append("            </conditionvar>")
            lines.append(f'            <setvar action="Set" varname="SCORE">{marks}</setvar>')
            lines.append("          </respcondition>")
            lines.append("        </resprocessing>")
        else:
            # Essay / String Response (response_str)
            lines.append("        <presentation>")
            lines.append("          <material>")
            lines.append(f"            <mattext texttype=\"text/html\"><![CDATA[{q_text}]]></mattext>")
            lines.append("          </material>")
            lines.append(f'          <response_str ident="response_{idx}" rcardinality="Single">')
            lines.append("            <render_fib rows=\"6\" columns=\"80\"/>")
            lines.append("          </response_str>")
            lines.append("        </presentation>")
            lines.append("        <resprocessing>")
            lines.append("          <outcomes><decvar varname=\"SCORE\" vartype=\"Decimal\"/></outcomes>")
            lines.append("        </resprocessing>")

        lines.append("      </item>")

    lines.append("    </section>")
    lines.append("  </assessment>")
    lines.append("</questestinterop>")
    return "\n".join(lines)


# ── 3. Google Forms JSON Exporter ────────────────────────────────────────────
def export_to_google_forms(paper: Dict[str, Any]) -> Dict[str, Any]:
    """
    Exports question paper to a schema directly consumable by the Google Forms API
    or a Google Apps Script Form Creator.
    """
    subject = paper.get("subject", "DevOps & Cloud Engineering Exam")
    org = paper.get("organization_name", "")
    duration = paper.get("duration_minutes", 180)
    total_marks = paper.get("total_marks", 80)

    description = f"{org + ' - ' if org else ''}Duration: {duration} mins | Total Marks: {total_marks}\n\nAnswer all questions carefully."

    form_payload = {
        "info": {
            "title": f"{subject} Examination",
            "documentTitle": f"{subject} - Examination Paper",
            "description": description,
        },
        "settings": {
            "quizSettings": {
                "isQuiz": True
            }
        },
        "items": []
    }

    sections = paper.get("sections", [])
    questions_to_export = []
    if sections:
        for sec in sections:
            for q in sec.get("questions", []):
                questions_to_export.append(q)
    else:
        questions_to_export = paper.get("questions", [])

    for idx, q in enumerate(questions_to_export, 1):
        q_text = q.get("text", "")
        marks = int(q.get("marks", 2))
        bloom = q.get("bloom_level", "Understand")
        options = q.get("options", [])
        correct_answer = str(q.get("answer", "")).strip()

        item_entry: Dict[str, Any] = {
            "title": f"Q{idx}. {q_text}",
            "description": f"[{marks} Marks] | Cognitive Depth: {bloom}",
        }

        if options and len(options) >= 2:
            # Choice Question
            opt_entries = []
            for opt in options:
                opt_str = str(opt).strip()
                is_correct = (opt_str.lower() == correct_answer.lower()) or (
                    len(opt_str) > 2 and opt_str[0].upper() == correct_answer[:1].upper()
                )
                opt_entries.append({
                    "value": opt_str,
                    "isCorrect": is_correct
                })

            item_entry["questionItem"] = {
                "question": {
                    "required": True,
                    "grading": {
                        "pointValue": marks,
                        "correctAnswers": {
                            "answers": [{"value": opt["value"]} for opt in opt_entries if opt["isCorrect"]]
                        }
                    },
                    "choiceQuestion": {
                        "type": "RADIO",
                        "options": [{"value": o["value"]} for o in opt_entries],
                        "shuffle": True
                    }
                }
            }
        else:
            # Paragraph text question
            item_entry["questionItem"] = {
                "question": {
                    "required": True,
                    "grading": {
                        "pointValue": marks,
                        "generalFeedback": {
                            "text": f"Model Answer: {correct_answer[:300]}" if correct_answer else ""
                        }
                    },
                    "textQuestion": {
                        "paragraph": True
                    }
                }
            }

        form_payload["items"].append(item_entry)

    return form_payload


# ── 4. Formatted Microsoft Word (.docx) Exporter ─────────────────────────────
def export_to_docx(paper: Dict[str, Any]) -> io.BytesIO:
    """
    Generates a beautifully formatted Microsoft Word document (.docx)
    with academic typography, institutional header table, instructions,
    and question breakdown.
    """
    try:
        import docx
        from docx.shared import Inches, Pt, RGBColor
        from docx.enum.text import WD_ALIGN_PARAGRAPH
        from docx.enum.table import WD_TABLE_ALIGNMENT
    except ImportError:
        logger.error("python-docx is not installed.")
        raise RuntimeError("python-docx is required for Word document export.")

    doc = docx.Document()

    # Set 0.75-inch page margins
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # 1. Institutional Title Header
    org_name = paper.get("organization_name", "DEPARTMENT OF COMPUTER SCIENCE & CLOUD COMPUTING").upper()
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run(org_name)
    title_run.font.name = "Arial"
    title_run.font.size = Pt(14)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(17, 24, 39)

    # Subject & Exam Name
    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = sub_p.add_run(f"EXAMINATION IN: {paper.get('subject', 'DevOps & AWS Engineering').upper()}")
    sub_run.font.name = "Arial"
    sub_run.font.size = Pt(12)
    sub_run.font.bold = True
    sub_run.font.color.rgb = RGBColor(79, 70, 229)

    # 2. Metadata Box Table
    table = doc.add_table(rows=2, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    cells = [
        ("Total Marks:", f"{paper.get('total_marks', 80)} Marks"),
        ("Time Allowed:", f"{paper.get('duration_minutes', 180)} Minutes"),
        ("Semester / Level:", paper.get("semester", "Advanced Cloud")),
        ("Exam Pattern:", paper.get("exam_pattern", "Standard").capitalize()),
        ("Subject Code:", f"CS-{abs(hash(paper.get('subject', 'devops'))) % 900 + 100}"),
        ("Date of Exam:", paper.get("created_at", "")[:10] or "Official Examination")
    ]

    for idx, (label, val) in enumerate(cells):
        row = idx // 3
        col = idx % 3
        cell = table.cell(row, col)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        r1 = p.add_run(f"{label} ")
        r1.font.bold = True
        r1.font.size = Pt(9.5)
        r2 = p.add_run(val)
        r2.font.size = Pt(9.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # 3. General Instructions
    inst_heading = doc.add_paragraph()
    inst_run = inst_heading.add_run("GENERAL INSTRUCTIONS:")
    inst_run.font.bold = True
    inst_run.font.size = Pt(10)
    inst_heading.paragraph_format.space_after = Pt(2)

    instructions = [
        "1. Answer all questions according to the section choices specified.",
        "2. Candidates are required to provide command syntax, manifest structure, and architectural rationales where appropriate.",
        "3. Marks and cognitive depth for each question are indicated in brackets alongside the question.",
    ]
    for inst in instructions:
        p = doc.add_paragraph(inst)
        p.paragraph_format.left_indent = Inches(0.2)
        p.paragraph_format.space_after = Pt(2)
        p.runs[0].font.size = Pt(9)
        p.runs[0].font.italic = True

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # 4. Sections & Questions
    sections = paper.get("sections", [])
    if not sections:
        sections = [{
            "name": "Examination Questions",
            "instructions": "Answer all questions.",
            "questions": paper.get("questions", [])
        }]

    q_counter = 1
    for sec_idx, sec in enumerate(sections, 1):
        sec_name = sec.get("name", f"Section {sec_idx}")
        sec_inst = sec.get("instructions", "")

        sec_p = doc.add_paragraph()
        sec_p.paragraph_format.space_before = Pt(12)
        sec_p.paragraph_format.space_after = Pt(3)
        sec_run = sec_p.add_run(sec_name.upper())
        sec_run.font.bold = True
        sec_run.font.size = Pt(11)
        sec_run.font.color.rgb = RGBColor(31, 41, 55)

        if sec_inst:
            inst_sub = doc.add_paragraph(f"({sec_inst})")
            inst_sub.paragraph_format.space_after = Pt(6)
            inst_sub.runs[0].font.size = Pt(9.5)
            inst_sub.runs[0].font.italic = True

        for q in sec.get("questions", []):
            marks = q.get("marks", 2)
            bloom = q.get("bloom_level", "Understand")
            q_text = q.get("text", "")
            options = q.get("options", [])

            qp = doc.add_paragraph()
            qp.paragraph_format.space_before = Pt(4)
            qp.paragraph_format.space_after = Pt(2)

            num_run = qp.add_run(f"Q{q_counter}. ")
            num_run.font.bold = True
            num_run.font.size = Pt(10)

            body_run = qp.add_run(q_text)
            body_run.font.size = Pt(10)

            meta_run = qp.add_run(f"   [{marks} Marks, Bloom: {bloom}]")
            meta_run.font.bold = True
            meta_run.font.size = Pt(9)
            meta_run.font.color.rgb = RGBColor(107, 114, 128)

            if options and len(options) >= 2:
                for opt_idx, opt in enumerate(options):
                    prefix = chr(65 + opt_idx)
                    opt_p = doc.add_paragraph(f"     ({prefix}) {opt}")
                    opt_p.paragraph_format.space_before = Pt(1)
                    opt_p.paragraph_format.space_after = Pt(1)
                    opt_p.runs[0].font.size = Pt(9.5)

            q_counter += 1

    # Save to BytesIO
    docx_stream = io.BytesIO()
    doc.save(docx_stream)
    docx_stream.seek(0)
    return docx_stream

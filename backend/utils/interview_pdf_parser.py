"""
Interview-style Q&A PDF extractor.

Unlike pdf_parser.py (built for university exam papers with 'Q1./marks-in-brackets'
patterns), this module targets DevOps/AWS *interview question* PDFs, which come in a
much wider variety of formats:

  - "Q1. <question>" / "Ans. <answer>"
  - "Question-1: <question>" / "Answer: <answer>"
  - Plain numbered "1. <question>" followed directly by prose/bullet answer (no "Ans:" marker)
  - Bullet-point answers ("•", "-", "o") under a numbered question
  - Cover / intro pages with no questions at all (skipped)
  - Notes/cheatsheet-style PDFs with headers + bullets but no interrogative numbering
    (these will simply yield 0 questions, which is expected and reported)

Output: for each PDF, a list of {question, answer, source} dicts. Grouped by source
PDF filename (NOT by subject — the user segregates subjects manually afterward).
"""

import re
import os
import logging

from utils.pdf_parser import extract_text_from_pdf

logger = logging.getLogger(__name__)

# --- Line classification patterns -------------------------------------------------

# "Q1.", "Q.1", "Q1)", "Q 1:" etc.
Q_PREFIXED_PATTERN = re.compile(r"^\s*Q\.?\s*(\d+)\s*[.):]\s*(.+)$", re.IGNORECASE)

# "Question-1:", "Question 1:", "Question1."
QUESTION_WORD_PATTERN = re.compile(r"^\s*Question[\s\-]*(\d+)\s*[.):]\s*(.+)$", re.IGNORECASE)

# Plain numbered line: "1. <text>" or "1) <text>"
PLAIN_NUMBERED_PATTERN = re.compile(r"^\s*(\d{1,3})\s*[.)]\s*(.+)$")

# Answer markers: "Ans.", "Ans:", "Answer:", "A.", "A:"
ANSWER_MARKER_PATTERN = re.compile(r"^\s*(?:Ans(?:wer)?|A)\s*[.:)]\s*(.*)$", re.IGNORECASE)

# Lines to always skip (cover pages, footers, page numbers, author credits, etc.)
SKIP_LINE_PATTERNS = [
    re.compile(r"^\s*page\s*\d+", re.IGNORECASE),
    re.compile(r"^\s*\d+\s*$"),  # bare page number
    re.compile(r"page\s+\d+\s+of\s+\d+", re.IGNORECASE),
    re.compile(r"linkedin\.com", re.IGNORECASE),
    re.compile(r"^\s*https?://", re.IGNORECASE),
    re.compile(r"click here to enrol", re.IGNORECASE),
    re.compile(r"^\s*by\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s*$"),  # "By Vishal Machan"
    re.compile(r"^\s*[-=_]{3,}\s*$"),
]

MIN_QUESTION_LEN = 8
MIN_ANSWER_LEN = 3


def _should_skip_line(line: str) -> bool:
    for pat in SKIP_LINE_PATTERNS:
        if pat.search(line):
            return True
    return False


def _looks_like_question(text: str) -> bool:
    """Heuristic: does this numbered line actually look like a question
    (vs. a numbered command/step in a cheatsheet, e.g. 'terraform init')?"""
    t = text.strip()
    if not t:
        return False
    if t.endswith("?"):
        return True
    question_starters = (
        "what", "why", "how", "explain", "describe", "define",
        "differentiate", "compare", "when", "where", "which", "who",
        "discuss",
        "can you", "is there", "does", "do you", "have you",
    )
    return t.lower().startswith(question_starters)


def parse_interview_qa_from_text(raw_text: str, source_file: str) -> list[dict]:
    """Parse Q&A pairs from raw interview-question PDF text.

    Handles three question-marker styles (checked in order per line):
      1. Q<N>. / Q.<N>
      2. Question-<N>: / Question <N>:
      3. Plain "<N>. <text>" — only accepted if it looks like a question
         (ends with '?' or starts with an interrogative/imperative keyword),
         to avoid misclassifying numbered command/step lists as questions.

    Everything between one question marker and the next is treated as the
    answer (bullets, code, prose all included), with a leading "Ans./Answer:"
    marker stripped if present.
    """
    lines = raw_text.split("\n")

    qa_pairs: list[dict] = []
    current_question: str | None = None
    current_answer_lines: list[str] = []

    def flush():
        nonlocal current_question, current_answer_lines
        if current_question:
            q_text = re.sub(r"\s+", " ", current_question).strip(" .")
            a_text = "\n".join(current_answer_lines).strip()
            a_text = re.sub(r"[ \t]+", " ", a_text)
            if len(q_text) >= MIN_QUESTION_LEN:
                qa_pairs.append({
                    "question": q_text,
                    "answer": a_text if len(a_text) >= MIN_ANSWER_LEN else "",
                    "source": source_file,
                })
        current_question = None
        current_answer_lines = []

    for raw_line in lines:
        line = raw_line.rstrip()
        stripped = line.strip()
        if not stripped:
            continue
        if _should_skip_line(stripped):
            continue

        # Try each question-marker pattern in order of specificity
        m = Q_PREFIXED_PATTERN.match(stripped)
        if not m:
            m = QUESTION_WORD_PATTERN.match(stripped)

        is_plain_numbered_question = False
        if not m:
            pm = PLAIN_NUMBERED_PATTERN.match(stripped)
            if pm and _looks_like_question(pm.group(2)):
                m = pm
                is_plain_numbered_question = True

        if m:
            flush()
            current_question = m.group(2).strip()
            current_answer_lines = []
            continue

        # Answer marker line (only meaningful once we have an open question)
        am = ANSWER_MARKER_PATTERN.match(stripped)
        if am and current_question is not None:
            rest = am.group(1).strip()
            if rest:
                current_answer_lines.append(rest)
            continue

        # Continuation line — part of the answer (or the question itself if
        # it wraps onto multiple lines before any answer content appears).
        if current_question is not None:
            if not current_answer_lines and not is_plain_numbered_question:
                # Could still be a question continuation (wrapped line) if the
                # Could still be a question continuation (wrapped line) if the
                # question doesn't yet end with '?'. PDFs commonly wrap a
                # question across two lines, e.g.:
                #   "How can you ensure high availability (HA) in"
                #   "Kubernetes?"
                # We treat any short line as a continuation until we see a
                # line ending in '?', after which subsequent lines are answer.
                if not current_question.rstrip().endswith("?") and len(stripped) < 120:
                    current_question = current_question + " " + stripped
                    continue
            current_answer_lines.append(stripped)

    flush()
    return qa_pairs


def parse_all_interview_pdfs(pdf_dir: str) -> dict[str, list[dict]]:
    """Parse all interview-question PDFs in a directory.

    Returns a mapping of {source_pdf_filename: [ {question, answer, source}, ... ]}
    grouped by source PDF (not by subject — segregate manually afterward).
    """
    results: dict[str, list[dict]] = {}

    if not os.path.isdir(pdf_dir):
        logger.error("PDF directory not found: %s", pdf_dir)
        return results

    pdf_files = sorted(f for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf"))
    logger.info("Found %d PDF files in %s", len(pdf_files), pdf_dir)

    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_dir, pdf_file)
        logger.info("Processing: %s", pdf_file)

        raw_text = extract_text_from_pdf(pdf_path)
        if not raw_text or not raw_text.strip():
            logger.warning("  No text extracted (even after OCR) from %s", pdf_file)
            results[pdf_file] = []
            continue

        qa_pairs = parse_interview_qa_from_text(raw_text, pdf_file)

        # Deduplicate near-identical questions within the same PDF
        seen = set()
        deduped = []
        for qa in qa_pairs:
            key = re.sub(r"\s+", " ", qa["question"].lower().strip())
            if key in seen or len(key) < MIN_QUESTION_LEN:
                continue
            seen.add(key)
            deduped.append(qa)

        results[pdf_file] = deduped
        logger.info("  Extracted %d Q&A pairs from %s", len(deduped), pdf_file)

    return results

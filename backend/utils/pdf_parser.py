import re
import os
import logging
import pdfplumber
import easyocr
import numpy as np
from PIL import Image
import io

logger = logging.getLogger(__name__)

# Initialize EasyOCR reader (lazy loaded)
_ocr_reader = None


def get_ocr_reader():
    global _ocr_reader
    if _ocr_reader is None:
        logger.info("Initializing EasyOCR reader (first time may download models)...")
        _ocr_reader = easyocr.Reader(["en"], gpu=False)
    return _ocr_reader

# Map PDF filenames to subject names used in the platform
SUBJECT_MAP = {
    "Artificial Intelligence - Previous Year QPs.pdf": "Artificial Intelligence",
    "Computer Architecture - QPs.pdf": "Computer Architecture and Parallel Processing",
    "Computer Network - QPs.pdf": "Computer Networks",
    "Data Structures - Previous Year QPs.pdf": "Data Structures",
    "Database Systems - Previous Year QPs.pdf": "Database Systems",
    "IoT and Cloud Computing - PYQPs.pdf": "IoT and Cloud Computing",
    "Java & C# - QPs.pdf": "Java and .NET and C#",
    "Linux and Shell Script - PYQPs.pdf": "Linux and Shell Scripts",
    "Network Security - PYQPs.pdf": "Network Security",
    "Operating System - QPs.pdf": "Operating Systems",
    "Software Engineering - QPs.pdf": "Software Engineering",
    "Web Development - PYQPs.pdf": "Web Development",
    "Web Development - Previous Year QPs.pdf": "Web Development",
    "Wireless Network - PYQPs.pdf": "Wireless Networks",
}


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from a PDF file. Falls back to OCR for scanned PDFs."""
    full_text = []
    is_scanned = False

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text and text.strip():
                    full_text.append(text)
                else:
                    is_scanned = True
    except Exception as e:
        logger.error("Failed to read PDF %s: %s", pdf_path, e)
        is_scanned = True

    # If we got text from at least some pages, return it
    if full_text and not is_scanned:
        return "\n".join(full_text)

    # Scanned PDF — use OCR
    logger.info("  Using OCR for scanned PDF: %s", os.path.basename(pdf_path))
    return extract_text_with_ocr(pdf_path)


def extract_text_with_ocr(pdf_path: str) -> str:
    """Extract text from scanned PDF using EasyOCR via pdfplumber images."""
    reader = get_ocr_reader()
    full_text = []

    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            for page_num, page in enumerate(pdf.pages, 1):
                if page_num % 5 == 1:
                    logger.info("    OCR pages %d-%d/%d...", page_num, min(page_num + 4, total_pages), total_pages)
                # Convert page to image at lower resolution for speed
                img = page.to_image(resolution=150)
                # Save to bytes buffer
                buf = io.BytesIO()
                img.save(buf, format="PNG")
                buf.seek(0)
                # Read with PIL and convert to grayscale for faster OCR
                pil_img = Image.open(buf).convert("L")
                # Convert to numpy array for easyocr
                img_array = np.array(pil_img)
                # Run OCR
                results = reader.readtext(img_array, detail=0, paragraph=True)
                page_text = "\n".join(results)
                if page_text.strip():
                    full_text.append(page_text)
    except Exception as e:
        logger.error("OCR failed for %s: %s", pdf_path, e)

    return "\n".join(full_text)


def parse_questions_from_text(raw_text: str) -> list[dict]:
    """Parse individual questions from extracted PDF text."""
    questions = []
    lines = raw_text.split("\n")
    current_question = ""
    current_marks = 0

    # Patterns to match question lines
    # e.g., "Q1.", "Q.1", "1.", "1)", "Q1)", "Q 1.", "(a)", "(i)", etc.
    q_pattern = re.compile(
        r"^\s*(?:Q\.?\s*)?(\d+)\s*[.)]\s*(.+)",
        re.IGNORECASE,
    )
    # Sub-question patterns: (a), (b), (i), (ii), a), b)
    sub_q_pattern = re.compile(
        r"^\s*(?:\(?[a-z]\)?|\(?[ivxlc]+\)?)\s*[.)]\s*(.+)",
        re.IGNORECASE,
    )
    # Marks pattern: [5], (5 marks), [5M], (5 Marks), etc.
    marks_pattern = re.compile(
        r"[\[\(]\s*(\d+)\s*(?:marks?|m|M)?\s*[\]\)]",
        re.IGNORECASE,
    )
    # Alternate marks at end of line: ... 5M, ... (5), ... [5]
    marks_end_pattern = re.compile(
        r"(\d+)\s*(?:marks?|m|M)\s*$",
        re.IGNORECASE,
    )

    # Lines to skip
    skip_patterns = [
        re.compile(r"^\s*(?:page|p\.?\s*\d+)", re.IGNORECASE),
        re.compile(r"^\s*(?:time|duration|date|max\.?\s*marks|total\s*marks|roll\s*no|reg)", re.IGNORECASE),
        re.compile(r"^\s*(?:instructions?|note|answer\s*(?:all|any)|attempt\s*(?:all|any))", re.IGNORECASE),
        re.compile(r"^\s*(?:part|section)\s*[-–:]\s*[a-c]", re.IGNORECASE),
        re.compile(r"^\s*(?:or|OR)\s*$"),
        re.compile(r"^\s*$"),
        re.compile(r"^\s*[-=_]{3,}\s*$"),
        re.compile(r"^\s*(?:university|college|department|examination|semester|subject|code|paper)", re.IGNORECASE),
        re.compile(r"^\s*(?:end\s*of|all\s*the\s*best|good\s*luck)", re.IGNORECASE),
        re.compile(r"^\s*(?:B\.?\s*(?:Tech|E|Sc|C\.?A)|M\.?\s*(?:Tech|Sc|C\.?A))", re.IGNORECASE),
    ]

    def should_skip(line: str) -> bool:
        for pat in skip_patterns:
            if pat.search(line):
                return True
        return False

    def flush_question():
        nonlocal current_question, current_marks
        if current_question:
            text = current_question.strip()
            # Clean up the question text
            text = re.sub(r"\s+", " ", text)
            text = re.sub(r"[\[\(]\s*\d+\s*(?:marks?|m|M)?\s*[\]\)]", "", text).strip()
            text = re.sub(r"\d+\s*(?:marks?|m|M)\s*$", "", text, flags=re.IGNORECASE).strip()
            # Remove trailing question number artifacts
            text = re.sub(r"^\d+[.)]\s*", "", text).strip()

            if text and len(text) > 15:
                questions.append({
                    "text": text,
                    "marks": current_marks if current_marks > 0 else 0,
                })
        current_question = ""
        current_marks = 0

    for line in lines:
        line = line.strip()
        if not line:
            continue

        if should_skip(line):
            continue

        # Check for marks in line
        marks_match = marks_pattern.search(line)
        if not marks_match:
            marks_match = marks_end_pattern.search(line)
        found_marks = int(marks_match.group(1)) if marks_match else 0

        # Check if this is a new main question
        q_match = q_pattern.match(line)
        if q_match:
            flush_question()
            current_question = q_match.group(2).strip()
            current_marks = found_marks
            continue

        # Check if this is a sub-question
        sub_match = sub_q_pattern.match(line)
        if sub_match:
            flush_question()
            current_question = sub_match.group(1).strip()
            current_marks = found_marks
            continue

        # Continuation of current question
        if current_question:
            current_question += " " + line
            if found_marks > 0:
                current_marks = found_marks

    # Flush last question
    flush_question()

    return questions


def classify_question_marks(question_text: str, marks: int) -> int:
    """Assign default marks if not detected."""
    if marks > 0:
        return marks
    text_lower = question_text.lower()
    if any(kw in text_lower for kw in ["define", "what is", "list", "name", "state", "short note"]):
        return 2
    elif any(kw in text_lower for kw in ["explain", "describe", "discuss", "differentiate"]):
        return 5
    elif any(kw in text_lower for kw in ["derive", "prove", "design", "implement", "write a program", "compare and contrast"]):
        return 10
    return 5


def classify_question_difficulty(question_text: str) -> str:
    """Classify question difficulty based on keywords."""
    text_lower = question_text.lower()
    hard_keywords = [
        "derive", "prove", "analyze", "design", "implement",
        "compare and contrast", "evaluate", "complexity",
        "optimize", "algorithm", "write a program", "code",
    ]
    medium_keywords = [
        "explain", "describe", "discuss", "illustrate",
        "differentiate", "working", "principle", "applications",
        "advantages", "disadvantages",
    ]
    for kw in hard_keywords:
        if kw in text_lower:
            return "hard"
    for kw in medium_keywords:
        if kw in text_lower:
            return "medium"
    return "easy"


def classify_question_type(question_text: str) -> str:
    """Classify question type."""
    q_lower = question_text.lower()
    if any(kw in q_lower for kw in ["explain", "describe", "discuss", "elaborate"]):
        return "descriptive"
    elif any(kw in q_lower for kw in ["compare", "differentiate", "contrast"]):
        return "comparative"
    elif any(kw in q_lower for kw in ["derive", "prove", "calculate"]):
        return "analytical"
    elif any(kw in q_lower for kw in ["write a program", "implement", "code"]):
        return "programming"
    elif any(kw in q_lower for kw in ["diagram", "draw", "illustrate"]):
        return "diagrammatic"
    elif any(kw in q_lower for kw in ["list", "enumerate", "name", "state"]):
        return "listing"
    elif any(kw in q_lower for kw in ["what is", "define", "short note"]):
        return "definition"
    else:
        return "descriptive"


def extract_topic_from_question(question_text: str) -> str:
    """Try to extract the main topic from a question."""
    text = question_text.strip()
    # Remove common question starters
    for prefix in [
        "explain", "describe", "discuss", "what is", "what are",
        "define", "list", "write", "compare", "differentiate",
        "derive", "prove", "illustrate", "draw", "state",
        "how", "why", "when", "where", "which",
        "the concept of", "the working of", "the principle of",
        "with a neat diagram", "with an example", "in detail",
        "briefly", "short note on",
    ]:
        text = re.sub(rf"^{prefix}\s+", "", text, flags=re.IGNORECASE)
        text = re.sub(rf"\s+{prefix}\s*[.?]?\s*$", "", text, flags=re.IGNORECASE)

    # Take first meaningful phrase (up to ~60 chars)
    text = text.strip(" .?!,;:")
    if len(text) > 60:
        # Try to cut at a natural boundary
        for sep in [",", ".", " and ", " with ", " using "]:
            idx = text.find(sep)
            if 10 < idx < 60:
                text = text[:idx]
                break
        else:
            text = text[:60]

    return text.strip() if len(text) > 3 else question_text[:60].strip()


def parse_all_pdfs(pdf_dir: str) -> dict[str, list[dict]]:
    """Parse all PDFs in directory and return subject->questions mapping."""
    all_data: dict[str, list[dict]] = {}

    if not os.path.isdir(pdf_dir):
        logger.error("PDF directory not found: %s", pdf_dir)
        return all_data

    pdf_files = [f for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf")]
    logger.info("Found %d PDF files in %s", len(pdf_files), pdf_dir)

    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_dir, pdf_file)
        subject = SUBJECT_MAP.get(pdf_file, pdf_file.replace(".pdf", "").strip())

        logger.info("Processing: %s → Subject: %s", pdf_file, subject)

        raw_text = extract_text_from_pdf(pdf_path)
        if not raw_text:
            logger.warning("No text extracted from %s", pdf_file)
            continue

        questions = parse_questions_from_text(raw_text)
        logger.info("  Extracted %d raw questions from %s", len(questions), pdf_file)

        # Enrich each question
        enriched = []
        seen_texts = set()
        for q in questions:
            text = q["text"]
            # Skip very short or duplicate questions
            text_key = re.sub(r"\s+", " ", text.lower().strip())
            if len(text_key) < 15 or text_key in seen_texts:
                continue
            seen_texts.add(text_key)

            marks = classify_question_marks(text, q.get("marks", 0))
            enriched.append({
                "text": text,
                "marks": marks,
                "difficulty": classify_question_difficulty(text),
                "question_type": classify_question_type(text),
                "topic": extract_topic_from_question(text),
                "source": pdf_file,
            })

        if subject in all_data:
            all_data[subject].extend(enriched)
        else:
            all_data[subject] = enriched

        logger.info("  Final: %d unique questions for '%s'", len(enriched), subject)

    return all_data

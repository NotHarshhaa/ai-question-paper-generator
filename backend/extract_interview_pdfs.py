"""
Script to extract interview-style Q&A from DevOps/AWS PDFs and save to JSON.

Unlike extract_pyqs.py (university exam-paper format), this targets interview
question PDFs and groups output by SOURCE PDF FILENAME, not by subject —
you segregate questions into subjects manually afterward.

Usage:
    python extract_interview_pdfs.py
"""

import os
import sys
import json
import logging

sys.path.insert(0, os.path.dirname(__file__))

from utils.interview_pdf_parser import parse_all_interview_pdfs

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

PDF_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "subject pdfs")
OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "data", "pyq_data.json")


def main():
    logger.info("=" * 60)
    logger.info("Interview Q&A PDF Extraction Tool")
    logger.info("=" * 60)
    logger.info("PDF Directory: %s", PDF_DIR)

    if not os.path.isdir(PDF_DIR):
        logger.error("PDF directory not found: %s", PDF_DIR)
        sys.exit(1)

    all_data = parse_all_interview_pdfs(PDF_DIR)

    if not all_data:
        logger.error("No PDFs found or processed!")
        sys.exit(1)

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    logger.info("Saved extracted data to %s", OUTPUT_JSON)

    total_questions = 0
    empty_files = []

    logger.info("")
    logger.info("=" * 60)
    logger.info("EXTRACTION RESULTS")
    logger.info("=" * 60)

    for pdf_file, qa_pairs in sorted(all_data.items()):
        total_questions += len(qa_pairs)
        logger.info("  %-65s: %4d questions", pdf_file, len(qa_pairs))
        if len(qa_pairs) == 0:
            empty_files.append(pdf_file)

    logger.info("")
    logger.info("=" * 60)
    logger.info("Total: %d PDFs, %d questions extracted", len(all_data), total_questions)
    if empty_files:
        logger.warning("PDFs with 0 questions extracted (%d):", len(empty_files))
        for f in empty_files:
            logger.warning("  - %s", f)
    logger.info("=" * 60)


if __name__ == "__main__":
    main()

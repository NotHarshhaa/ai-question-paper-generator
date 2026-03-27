"""
Script to extract questions from PYQ PDFs and save to database.
Run this once to populate the PYQ database.

Usage:
    python extract_pyqs.py
"""

import os
import sys
import json
import logging

# Add parent dir to path
sys.path.insert(0, os.path.dirname(__file__))

from utils.pdf_parser import parse_all_pdfs
from database.db import init_db, get_connection

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Path to PYQ PDFs folder
PDF_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "subject pdfs")
# Output JSON for reference
OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "data", "pyq_data.json")


def init_pyq_table():
    """Create the PYQ questions table."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pyq_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            text TEXT NOT NULL,
            marks INTEGER DEFAULT 0,
            difficulty TEXT DEFAULT 'medium',
            question_type TEXT DEFAULT 'descriptive',
            topic TEXT DEFAULT '',
            source_file TEXT DEFAULT ''
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pyq_subject ON pyq_questions(subject)")
    conn.commit()
    conn.close()


def clear_pyq_table():
    """Clear existing PYQ data before re-importing."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM pyq_questions")
    conn.commit()
    conn.close()


def insert_pyq_questions(subject: str, questions: list[dict]):
    """Insert parsed questions into the database."""
    conn = get_connection()
    cursor = conn.cursor()
    for q in questions:
        cursor.execute(
            """
            INSERT INTO pyq_questions (subject, text, marks, difficulty, question_type, topic, source_file)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                subject,
                q["text"],
                q.get("marks", 0),
                q.get("difficulty", "medium"),
                q.get("question_type", "descriptive"),
                q.get("topic", ""),
                q.get("source", ""),
            ),
        )
    conn.commit()
    conn.close()


def main():
    logger.info("=" * 60)
    logger.info("PYQ Extraction Tool")
    logger.info("=" * 60)
    logger.info("PDF Directory: %s", PDF_DIR)

    if not os.path.isdir(PDF_DIR):
        logger.error("PDF directory not found: %s", PDF_DIR)
        sys.exit(1)

    # Initialize database
    init_db()
    init_pyq_table()
    clear_pyq_table()

    # Parse all PDFs
    logger.info("Parsing PDFs...")
    all_data = parse_all_pdfs(PDF_DIR)

    if not all_data:
        logger.error("No questions extracted from any PDF!")
        sys.exit(1)

    # Save to JSON for reference
    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    logger.info("Saved extracted data to %s", OUTPUT_JSON)

    # Insert into database
    total_questions = 0
    logger.info("")
    logger.info("=" * 60)
    logger.info("EXTRACTION RESULTS")
    logger.info("=" * 60)

    for subject, questions in sorted(all_data.items()):
        insert_pyq_questions(subject, questions)
        total_questions += len(questions)

        # Count by difficulty
        easy = sum(1 for q in questions if q["difficulty"] == "easy")
        medium = sum(1 for q in questions if q["difficulty"] == "medium")
        hard = sum(1 for q in questions if q["difficulty"] == "hard")

        logger.info(
            "  %-50s: %3d questions (E:%d M:%d H:%d)",
            subject, len(questions), easy, medium, hard,
        )

    logger.info("")
    logger.info("=" * 60)
    logger.info("Total: %d subjects, %d questions extracted", len(all_data), total_questions)
    logger.info("Database updated successfully!")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()

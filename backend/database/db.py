import sqlite3
import json
import os
from config import DATABASE_PATH


def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS papers (
            id TEXT PRIMARY KEY,
            subject TEXT NOT NULL,
            university_name TEXT DEFAULT '',
            semester TEXT DEFAULT '',
            syllabus TEXT NOT NULL,
            exam_pattern TEXT NOT NULL,
            total_marks INTEGER NOT NULL,
            duration_minutes INTEGER NOT NULL,
            num_questions INTEGER NOT NULL,
            difficulty_distribution TEXT NOT NULL,
            questions TEXT NOT NULL,
            sections TEXT NOT NULL,
            syllabus_topics TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def save_paper(paper_data: dict):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO papers (
            id, subject, university_name, semester, syllabus,
            exam_pattern, total_marks, duration_minutes, num_questions,
            difficulty_distribution, questions, sections, syllabus_topics, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            paper_data["id"],
            paper_data["subject"],
            paper_data.get("university_name", ""),
            paper_data.get("semester", ""),
            paper_data.get("syllabus", ""),
            paper_data.get("exam_pattern", "standard"),
            paper_data["total_marks"],
            paper_data["duration_minutes"],
            paper_data.get("num_questions", len(paper_data["questions"])),
            json.dumps(paper_data.get("difficulty_distribution", {})),
            json.dumps(paper_data["questions"]),
            json.dumps(paper_data["sections"]),
            json.dumps(paper_data.get("syllabus_topics", [])),
            paper_data["created_at"],
        ),
    )
    conn.commit()
    conn.close()


def get_all_papers():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, subject, total_marks, created_at, num_questions, university_name FROM papers ORDER BY created_at DESC"
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_paper_by_id(paper_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM papers WHERE id = ?", (paper_id,))
    row = cursor.fetchone()
    conn.close()
    if row is None:
        return None
    paper = dict(row)
    paper["questions"] = json.loads(paper["questions"])
    paper["sections"] = json.loads(paper["sections"])
    paper["syllabus_topics"] = json.loads(paper["syllabus_topics"])
    paper["difficulty_distribution"] = json.loads(paper["difficulty_distribution"])
    return paper


def delete_paper_by_id(paper_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM papers WHERE id = ?", (paper_id,))
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    return deleted > 0

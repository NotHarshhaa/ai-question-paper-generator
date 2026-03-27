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


def delete_paper(paper_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM papers WHERE id = ?", (paper_id,))
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    return deleted > 0


# PYQ Database Functions
def get_pyq_questions_by_subject(subject: str, limit: int = 50) -> list[dict]:
    """Get PYQ questions for a specific subject."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT text, marks, difficulty, question_type, topic, source_file
        FROM pyq_questions
        WHERE subject = ?
        ORDER BY RANDOM()
        LIMIT ?
        """,
        (subject, limit)
    )
    questions = []
    for row in cursor.fetchall():
        questions.append({
            "text": row["text"],
            "marks": row["marks"],
            "difficulty": row["difficulty"],
            "question_type": row["question_type"],
            "topic": row["topic"],
            "source": row["source_file"]
        })
    conn.close()
    return questions


def get_pyq_questions_by_difficulty(subject: str, difficulty: str, limit: int = 20) -> list[dict]:
    """Get PYQ questions for a subject filtered by difficulty."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT text, marks, difficulty, question_type, topic, source_file
        FROM pyq_questions
        WHERE subject = ? AND difficulty = ?
        ORDER BY RANDOM()
        LIMIT ?
        """,
        (subject, difficulty, limit)
    )
    questions = []
    for row in cursor.fetchall():
        questions.append({
            "text": row["text"],
            "marks": row["marks"],
            "difficulty": row["difficulty"],
            "question_type": row["question_type"],
            "topic": row["topic"],
            "source": row["source_file"]
        })
    conn.close()
    return questions


def get_pyq_topics_by_subject(subject: str) -> list[str]:
    """Get unique topics from PYQ questions for a subject."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT DISTINCT topic
        FROM pyq_questions
        WHERE subject = ? AND topic != ''
        ORDER BY topic
        """,
        (subject,)
    )
    topics = [row["topic"] for row in cursor.fetchall()]
    conn.close()
    return topics


def get_pyq_stats_by_subject(subject: str) -> dict:
    """Get statistics about PYQ questions for a subject."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN difficulty = 'easy' THEN 1 ELSE 0 END) as easy,
            SUM(CASE WHEN difficulty = 'medium' THEN 1 ELSE 0 END) as medium,
            SUM(CASE WHEN difficulty = 'hard' THEN 1 ELSE 0 END) as hard,
            AVG(marks) as avg_marks,
            MAX(marks) as max_marks,
            MIN(marks) as min_marks
        FROM pyq_questions
        WHERE subject = ?
        """,
        (subject,)
    )
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "total": row["total"],
            "easy": row["easy"],
            "medium": row["medium"],
            "hard": row["hard"],
            "avg_marks": round(row["avg_marks"], 1) if row["avg_marks"] else 0,
            "max_marks": row["max_marks"] or 0,
            "min_marks": row["min_marks"] or 0
        }
    return {"total": 0, "easy": 0, "medium": 0, "hard": 0, "avg_marks": 0, "max_marks": 0, "min_marks": 0}

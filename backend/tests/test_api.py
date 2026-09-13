# =============================================================================
# backend/tests/test_api.py — Core API Endpoint Tests
# =============================================================================
import unittest
import io
import json
from app import app


class TestAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config["TESTING"] = True
        cls.client = app.test_client()

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("status", data)
        self.assertEqual(data["status"], "ok")
        self.assertIn("llm", data)

    def test_llm_status(self):
        response = self.client.get("/api/llm/status")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("mode", data)
        self.assertIn("available", data)

    def test_get_subjects(self):
        response = self.client.get("/api/subjects")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_upload_syllabus_plain_text(self):
        syllabus_bytes = b"Unit 1: Cloud Principles\n- IAM and Security Groups\n- EC2 Instances"
        response = self.client.post(
            "/api/upload-syllabus",
            data={"file": (io.BytesIO(syllabus_bytes), "test_syllabus.txt")},
            content_type="multipart/form-data"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("topics", data)
        self.assertIn("units", data)
        self.assertGreater(len(data["topics"]), 0)

    def test_generate_missing_data(self):
        response = self.client.post("/api/generate", json={})
        self.assertEqual(response.status_code, 400)

    def test_db_backup(self):
        response = self.client.post("/api/db/backup")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("backup_file", data)

    def test_async_generation_and_polling(self):
        payload = {
            "subject": "AWS Cloud Fundamentals",
            "syllabus": "Unit 1: Cloud Concepts\n- S3 Storage Classes\n- EC2 Pricing",
            "num_questions": 2,
            "total_marks": 10
        }
        res = self.client.post("/api/generate/async", json=payload)
        self.assertEqual(res.status_code, 202)
        data = res.get_json()
        self.assertIn("task_id", data)
        task_id = data["task_id"]

        poll_res = self.client.get(f"/api/tasks/{task_id}")
        self.assertEqual(poll_res.status_code, 200)
        task_data = poll_res.get_json()
        self.assertIn(task_data["status"], ["queued", "processing", "completed"])

        # Wait for completion so subsequent database tests don't encounter locked tables
        import time
        for _ in range(50):
            p = self.client.get(f"/api/tasks/{task_id}").get_json()
            if p["status"] in ("completed", "failed"):
                break
            time.sleep(0.1)

    def test_lms_exports(self):
        import uuid
        from database.db import save_paper
        paper_id = f"test-lms-{uuid.uuid4().hex[:8]}"
        test_paper = {
            "id": paper_id,
            "subject": "Docker Containerization",
            "total_marks": 20,
            "duration_minutes": 60,
            "questions": [
                {
                    "id": "q1",
                    "text": "What is the primary difference between an image and a container?",
                    "marks": 5,
                    "bloom_level": "Understand",
                    "options": ["Image is static, container is runtime", "No difference", "Container is larger", "None"],
                    "answer": "Image is static, container is runtime"
                }
            ],
            "sections": [
                {
                    "name": "Section A",
                    "total_marks": 20,
                    "questions": [
                        {
                            "id": "q1",
                            "text": "What is the primary difference between an image and a container?",
                            "marks": 5,
                            "bloom_level": "Understand",
                            "options": ["Image is static, container is runtime", "No difference", "Container is larger", "None"],
                            "answer": "Image is static, container is runtime"
                        }
                    ]
                }
            ],
            "created_at": "2026-09-13T00:00:00Z"
        }
        save_paper(test_paper)

        # 1. Moodle XML
        moodle_res = self.client.get(f"/api/papers/{test_paper['id']}/export/moodle")
        self.assertEqual(moodle_res.status_code, 200)
        self.assertIn(b"<quiz>", moodle_res.data)

        # 2. QTI 2.1
        qti_res = self.client.get(f"/api/papers/{test_paper['id']}/export/qti")
        self.assertEqual(qti_res.status_code, 200)
        self.assertIn(b"<questestinterop", qti_res.data)

        # 3. Google Forms
        gf_res = self.client.get(f"/api/papers/{test_paper['id']}/export/google-forms")
        self.assertEqual(gf_res.status_code, 200)
        gf_data = gf_res.get_json()
        self.assertIn("items", gf_data)

        # 4. Word DOCX
        docx_res = self.client.get(f"/api/papers/{test_paper['id']}/export/docx")
        self.assertEqual(docx_res.status_code, 200)
        self.assertGreater(len(docx_res.data), 1000)

    def test_hybrid_rag_search(self):
        from app import rag_engine
        results = rag_engine.search("kubectl rollout undo", top_k=3)
        self.assertIsInstance(results, list)
        if results:
            first = results[0]
            self.assertIn("similarity_score", first)
            self.assertIn("bm25_score", first)
            self.assertIn("rrf_score", first)


if __name__ == "__main__":
    unittest.main()



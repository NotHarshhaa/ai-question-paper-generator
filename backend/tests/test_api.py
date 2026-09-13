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


if __name__ == "__main__":
    unittest.main()


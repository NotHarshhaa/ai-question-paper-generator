import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

DATABASE_PATH = os.path.join(BASE_DIR, "database", "papers.db")
MODELS_DIR = os.path.join(BASE_DIR, "models")
PDF_OUTPUT_DIR = os.path.join(BASE_DIR, "output")

# Ensure directories exist
for d in [os.path.dirname(DATABASE_PATH), MODELS_DIR, PDF_OUTPUT_DIR]:
    os.makedirs(d, exist_ok=True)

# Model names (Hugging Face)
T5_MODEL_NAME = os.getenv("T5_MODEL_NAME", "valhalla/t5-small-qg-hl")
BERT_MODEL_NAME = os.getenv("BERT_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")

# Flask
FLASK_HOST = os.getenv("FLASK_HOST", "127.0.0.1")
FLASK_PORT = int(os.getenv("FLASK_PORT", "5000"))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "true").lower() == "true"

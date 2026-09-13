import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Database & Storage (Supports local, mounted volume, or container mounts)
DATABASE_PATH = os.getenv("DATABASE_PATH", os.path.join(BASE_DIR, "database", "papers.db"))
PAPERS_BACKUP_DIR = os.getenv("PAPERS_BACKUP_DIR", os.path.join(BASE_DIR, "database", "backups"))
PAPERS_BACKUP_S3_BUCKET = os.getenv("PAPERS_BACKUP_S3_BUCKET", "")

MODELS_DIR = os.path.join(BASE_DIR, "models")
PDF_OUTPUT_DIR = os.path.join(BASE_DIR, "output")

# Ensure directories exist
for d in [os.path.dirname(DATABASE_PATH), PAPERS_BACKUP_DIR, MODELS_DIR, PDF_OUTPUT_DIR]:
    os.makedirs(d, exist_ok=True)

# Concurrency & Resource Throttling (Prevents CPU starvation on ML inference)
TORCH_NUM_THREADS = int(os.getenv("TORCH_NUM_THREADS", "2"))
MAX_CONCURRENT_GENERATIONS = int(os.getenv("MAX_CONCURRENT_GENERATIONS", "2"))

# Model names (Hugging Face)
T5_MODEL_NAME = os.getenv("T5_MODEL_NAME", "valhalla/t5-small-qg-hl")
BERT_MODEL_NAME = os.getenv("BERT_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")

# LLM Gateway Configuration
# Default model can be gemini/gemini-2.0-flash, gemini/gemini-1.5-flash, openai/gpt-4o-mini,
# groq/llama-3.3-70b-versatile, deepseek/deepseek-chat, or ollama/llama3
DEFAULT_LLM_MODEL = os.getenv("DEFAULT_LLM_MODEL", "gemini/gemini-2.0-flash")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.7"))
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# Flask
FLASK_HOST = os.getenv("FLASK_HOST", "0.0.0.0")
FLASK_PORT = int(os.getenv("FLASK_PORT", "5000"))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "true").lower() == "true"



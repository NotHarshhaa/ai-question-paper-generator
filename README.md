# 🧠 AI-Based DevOps & AWS Question Paper Generator

An intelligent full-stack system that automatically generates **DevOps and AWS certification & university-style question papers** using **Modern LLMs, Semantic RAG, and NLP** techniques. Includes an interactive **2,500+ Question Bank**, **LLM-as-a-Judge Auto-Grader Playground**, **Context-Aware Bloom's Taxonomy Classifier**, **Certification MCQ & Distractor Generator**, **Platform Analytics Dashboard**, **Teacher Solution Key Mode**, and **Multi-Format Exporters**.

---

## 🚀 Key AI & ML Features

* 🤖 **Multi-Provider LLM Gateway**: Seamless integration with **Google Gemini** (`gemini-2.0-flash`), **OpenAI** (`gpt-4o-mini`), **Groq** (`llama-3.3-70b`), **DeepSeek**, **Anthropic**, and local **Ollama** (`llama3`), with structured JSON schema output validation and resilient offline fallbacks.
* 📊 **Interactive Mermaid.js Architecture Diagrams**: Visual topology rendering for cloud architecture, CI/CD pipelines, and multi-tier systems. Diagrams render dynamically in browser with fullscreen preview, copyable code, and instant dark mode support.
* ⚡ **True Hybrid RAG Grounding Engine (Dense + BM25)**: Combines dense semantic Sentence-BERT embeddings (`all-MiniLM-L6-v2`) with lexical Okapi BM25 keyword matching via Reciprocal Rank Fusion (RRF). Features compressed on-disk vector caching (`.cache/rag_embeddings.npz`) for instant (<100ms) cold starts.
* ⏳ **Async Generation Task Queue & Live Stage Progress**: Background worker pool (`POST /api/generate/async` and `GET /api/tasks/<id>`) that eliminates HTTP proxy timeouts on large exams, providing real-time stage progress updates in the UI.
* 🎓 **Full LMS & Multi-Format Exporters**: Direct one-click exports to **Moodle Quiz XML**, **Canvas & Blackboard IMS QTI 2.1**, **Google Forms JSON Schema**, and styled **Microsoft Word (`.docx`)** documents alongside formatted PDF, Markdown, and JSON.
* 📁 **Universal Syllabus Document Ingestion**: Upload real academic or enterprise syllabi in **PDF (`.pdf`)**, **Word (`.docx`)**, or text/markdown (`.txt`, `.md`) with server-side extraction (`pdfplumber` + `python-docx`) and smart fallback parsing.
* 🧠 **Flexible Syllabus Architecture Parsing**: Automatically detects syllabus structures across Units, Modules, Chapters, Roman numerals, comma-separated lists, and multi-line paragraph descriptions without requiring rigid bullet lists.
* 💻 **DevOps Syntax & ASCII Architecture Diagram Rendering**: Built-in `RichContent` renderer that color-highlights **YAML, Terraform HCL, Dockerfile, Bash, and JSON** code blocks and cleanly renders ASCII architecture topologies in questions and model solutions.
* ⏱️ **Interactive Student Examination Arena**: Full live test environment for students featuring a configurable countdown timer, question navigator, answered/flagged indicators, and an end-to-end auto-grading evaluation scorecard.
* 📝 **LLM-as-a-Judge Auto-Grader**: Grades student submissions against a 4-pillar rubric (Technical Correctness 40%, Syntax & Command Precision 30%, Completeness 20%, Clarity 10%) with line-by-line feedback, concept coverage metrics, and actionable improvement tips.
* 🎯 **MCQ & Contextual Distractor Synthesis**: Generates 4-option certification MCQs with realistic distractors targeting specific cloud engineering misconceptions (e.g. S3 storage classes, Kubernetes service types, Terraform state locking) and detailed explanations.
* 🎓 **Context-Aware Bloom's Taxonomy Classifier**: Categorizes questions into cognitive depth (*Remember, Understand, Apply, Analyze, Evaluate, Create*) using context-aware heuristics and LLM batch evaluation to ensure balanced exams.
* 🔑 **Teacher Solution Key Mode**: Instantly generates comprehensive model answers with verified CLI syntax, IaC manifests (YAML/HCL), and point-by-point grading rubrics.
* 🗂️ **Interactive Question Bank (2,500+ Questions)**: Browse, search, filter, and practice curated questions with complete solutions across 18+ DevOps & Cloud domains.
* ✍️ **Interactive Paper Editor**: Modify questions, update marks, rebalance sections, or add custom questions inline.
* 📊 **Platform Analytics & PYQ Intelligence**: Real-time visual metrics on subject question volume, difficulty ratios, and Bloom's taxonomy distributions.

---

## 🏗️ System Architecture

```
[ Frontend: Next.js 15 + React 19 + Tailwind CSS ] 
                         │  (HTTP / REST API)
                         ▼
[ Backend: Python Flask Server ]
   ├── Unified LLM Gateway ────────────► Gemini / OpenAI / Groq / DeepSeek / Ollama
   ├── Vector RAG Engine (Embeddings) ─► Grounds generation in 2,500+ authentic PYQs
   ├── Question Engine (LLM + PYQ) ────► Generates scenario, architecture & coding questions
   ├── Smart Selector (Sentence-BERT) ─► Eliminates semantic duplicates & balances marks
   ├── Bloom's Classifier ─────────────► Evaluates cognitive depth (Remember -> Create)
   ├── LLM-as-a-Judge Auto-Grader ─────► Multi-pillar rubric evaluation with feedback
   ├── MCQ & Distractor Generator ─────► Contextual distractor synthesis with explanations
   ├── Solution Key Generator ─────────► Concrete technical solutions with code & rubrics
   ├── SQLite Database (papers.db) ────► Auto-seeds & stores 2,500+ PYQs and exams
   └── PDF Generator (ReportLab) ──────► Renders print-ready formatted PDFs
```

---

## 🧰 Tech Stack

* **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Sonner
* **Backend:** Python 3.11+, Flask, Flask-CORS, Gunicorn
* **AI & LLM Gateway:** LiteLLM / Google Gemini / OpenAI / Groq / Ollama / DeepSeek
* **NLP & Information Retrieval:** NLTK, Scikit-learn (TF-IDF), NumPy
* **Embeddings & RAG:** Sentence-Transformers (`all-MiniLM-L6-v2`), In-Memory Cosine Similarity Vector Index
* **Database:** SQLite (WAL mode, auto-seeded with 2,550+ questions & solutions)
* **Document Export:** ReportLab (PDF), Markdown, JSON

---

## 📚 Supported Subjects & Domains

* ☁️ **AWS Cloud Fundamentals**
* 💻 **AWS Compute (EC2, Auto Scaling, Load Balancing)**
* 🗄️ **AWS Storage & Databases (S3, RDS, DynamoDB)**
* 🌐 **AWS Networking (VPC, Route 53, CloudFront)**
* 🔒 **AWS Security, IAM & Governance**
* ⚡ **AWS Serverless (Lambda, API Gateway, Step Functions)**
* 🐳 **Docker & Containerization**
* ☸️ **Kubernetes & Container Orchestration**
* 🔄 **CI/CD Pipelines & Automation**
* 🛠️ **Jenkins**
* 🏗️ **Terraform & Infrastructure as Code (IaC)**
* 📜 **Ansible & Configuration Management**
* 🐧 **Linux Administration & Shell Scripting**
* 🌿 **Git & Distributed Version Control**
* 📈 **Monitoring & Observability (CloudWatch, Prometheus, Grafana)**
* 🛡️ **Site Reliability Engineering (SRE) & DevSecOps**
* 🧩 **Microservices Architecture & Distributed Systems**

---

## ⚙️ Installation & Setup

### Option A: ⚡ Instant Launch with Docker Compose (Recommended)
Launch the complete full-stack environment with a single command:
```bash
docker compose up --build
```
* **Frontend:** [http://localhost:3000](http://localhost:3000)
* **Backend API:** [http://localhost:5000](http://localhost:5000)
* **Storage:** Persistent SQLite volume (`papers_data`) ensures questions and exams survive container restarts.
* **Healthcheck:** Automatic dependency orchestration ensures the backend is fully initialized before the frontend connects.

---

### Option B: Local Manual Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/NotHarshhaa/ai-question-paper-generator.git
cd ai-question-paper-generator
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
> The backend server starts at `http://127.0.0.1:5000`, auto-seeds the database with 2,500+ DevOps PYQs, and builds the Vector RAG index.

#### 3. (Optional) Configure Your Preferred LLM Provider
Create or edit `backend/.env`:
```bash
# Option 1: Google Gemini (Recommended)
DEFAULT_LLM_MODEL=gemini/gemini-2.0-flash
GEMINI_API_KEY=your_gemini_api_key_here

# Option 2: OpenAI
DEFAULT_LLM_MODEL=openai/gpt-4o-mini
OPENAI_API_KEY=your_openai_api_key_here

# Option 3: Groq (Ultra-fast)
DEFAULT_LLM_MODEL=groq/llama-3.3-70b-versatile
GROQ_API_KEY=your_groq_api_key_here

# Option 4: Local Ollama (100% private & offline)
DEFAULT_LLM_MODEL=ollama/llama3
OLLAMA_BASE_URL=http://localhost:11434
```
*Note: If no API key is provided, the platform automatically operates in High-Grade Offline Fallback mode with authentic domain templates.*

#### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Production DevOps & Cloud Infrastructure

### 1. Remote Terraform Backend with S3 & DynamoDB Locking
To prevent state leakage and lock state across team members:
```bash
# 1. Bootstrap S3 bucket and DynamoDB locking table
bash scripts/bootstrap_tf_backend.sh

# 2. Configure backend.tf
cp terraform/backend.tf.example terraform/backend.tf
# (Set your generated bucket and table name in backend.tf)

# 3. Initialize & migrate state
cd terraform && terraform init
```

### 2. Automated CI/CD Workflows (GitHub Actions)
Continuous Integration is configured in `.github/workflows/ci.yml`:
* **Backend Pipeline:** Python 3.11 linting (Flake8), automated test execution.
* **Frontend Pipeline:** Node.js 20 ESLint checks, TypeScript strict validation, Next.js build verification.
* **Terraform Pipeline:** `terraform fmt -check`, `terraform init`, `terraform validate`.
* **Container Pipeline:** Automated Docker Buildx multi-stage image verification.

### 3. Concurrency Protection & PyTorch CPU Throttling
* **Gunicorn Concurrency:** Configured with `gthread` workers and preloaded models in `gunicorn.conf.py` to share Sentence-BERT memory across threads.
* **CPU Starvation Shield:** PyTorch CPU thread count capped via `TORCH_NUM_THREADS` and generation concurrency controlled via `MAX_CONCURRENT_GENERATIONS`.

### 4. Database Durability & S3 Snapshots
* Automated SQLite live backup via SQLite Online Backup API:
```bash
# Manual or cron snapshot
python backend/utils/db_backup.py backup
# Or run the cron script
bash scripts/backup_db.sh
```
* Optionally syncs snapshots to AWS S3 by setting `PAPERS_BACKUP_S3_BUCKET=your-bucket-name`.


---

## 📡 API Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/generate` | `POST` | Generates a structured question paper with Bloom cognitive tagging |
| `/api/generate/async` | `POST` | Submits generation job to background thread pool (returns `task_id` for polling) |
| `/api/tasks/<task_id>` | `GET` | Polls async generation status (progress %, stage description, and final paper result) |
| `/api/evaluate-answer` | `POST` | AI Auto-Grades a student answer using LLM-as-a-Judge (or semantic embeddings fallback) |
| `/api/generate-mcq` | `POST` | Generates 4-option certification MCQs with realistic distractors & explanations |
| `/api/llm/status` | `GET` | Returns active LLM provider, model, and availability status |
| `/api/papers` | `GET` | Retrieves all previously generated papers |
| `/api/papers/<id>` | `GET` | Retrieves details for a specific paper |
| `/api/papers/<id>` | `PUT` | Updates paper content (modified questions, marks, title) |
| `/api/papers/<id>` | `DELETE` | Deletes a paper from history |
| `/api/papers/<id>/solutions` | `GET` | Returns concrete model solutions, code snippets, and grading rubrics |
| `/api/papers/<id>/pdf` | `GET` | Exports the paper as a print-ready PDF |
| `/api/papers/<id>/export/docx` | `GET` | Exports styled Microsoft Word (`.docx`) examination document |
| `/api/papers/<id>/export/moodle` | `GET` | Exports Moodle Quiz XML (`.xml`) for direct LMS course import |
| `/api/papers/<id>/export/qti` | `GET` | Exports Canvas / Blackboard IMS QTI 2.1 package (`.xml`) |
| `/api/papers/<id>/export/google-forms` | `GET` | Generates Google Forms API quiz schema (`.json`) |
| `/api/question-bank` | `GET` | Paginated search & filter for 2,500+ PYQ questions |
| `/api/analytics` | `GET` | Aggregated metrics, subject breakdown, and Bloom taxonomy distribution |
| `/api/subjects` | `GET` | Lists all supported subjects |
| `/api/analyze-syllabus` | `POST` | Extracts units and topics from raw syllabus text |
| `/api/upload-syllabus` | `POST` | Ingests PDF (`.pdf`), Word (`.docx`), or text files and extracts structured syllabus units & topics |
| `/api/db/backup` | `POST` | Triggers a live, transaction-consistent SQLite snapshot (with optional S3 sync) |
| `/api/health` | `GET` | Health check endpoint reporting server & LLM Gateway status |

---

## 👨‍💻 Creator

Developed with ❤️ by **[H A R S H H A A](https://github.com/NotHarshhaa)**
* **GitHub:** [@NotHarshhaa](https://github.com/NotHarshhaa)
* **LinkedIn:** [notharshhaa](https://linkedin.com/in/notharshhaa)
* **Email:** [contact@harshhaa.dev](mailto:contact@harshhaa.dev)

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

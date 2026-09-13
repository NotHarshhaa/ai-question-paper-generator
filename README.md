# 🧠 AI-Based DevOps & AWS Question Paper Generator

An intelligent full-stack system that automatically generates **DevOps and AWS certification & university-style question papers** using **Modern LLMs, Semantic RAG, and NLP** techniques. Includes an interactive **2,500+ Question Bank**, **LLM-as-a-Judge Auto-Grader Playground**, **Context-Aware Bloom's Taxonomy Classifier**, **Certification MCQ & Distractor Generator**, **Platform Analytics Dashboard**, **Teacher Solution Key Mode**, and **Multi-Format Exporters**.

---

## 🚀 Key AI & ML Features

* 🤖 **Multi-Provider LLM Gateway**: Seamless integration with **Google Gemini** (`gemini-2.0-flash`), **OpenAI** (`gpt-4o-mini`), **Groq** (`llama-3.3-70b`), **DeepSeek**, **Anthropic**, and local **Ollama** (`llama3`), with structured JSON schema output validation and resilient offline fallbacks.
* ☁️ **Syllabus-Based Topic Extraction**: Analyzes syllabus units and extracts high-weightage topics using NLTK and TF-IDF keyword ranking.
* 📝 **LLM-as-a-Judge Auto-Grader**: Grades student submissions against a 4-pillar rubric (Technical Correctness 40%, Syntax & Command Precision 30%, Completeness 20%, Clarity 10%) with line-by-line feedback, concept coverage metrics, and actionable improvement tips.
* 🎯 **MCQ & Contextual Distractor Synthesis**: Generates 4-option certification MCQs with realistic distractors targeting specific cloud engineering misconceptions (e.g. S3 storage classes, Kubernetes service types, Terraform state locking) and detailed explanations.
* 🎓 **Context-Aware Bloom's Taxonomy Classifier**: Categorizes questions into cognitive depth (*Remember, Understand, Apply, Analyze, Evaluate, Create*) using context-aware heuristics and LLM batch evaluation to ensure balanced exams.
* 🔍 **Vector RAG Grounding Engine**: High-speed vector index across 2,500+ authentic PYQs (using Sentence-BERT `all-MiniLM-L6-v2`) to ground LLM generation in verified exam patterns.
* 🔑 **Teacher Solution Key Mode**: Instantly generates comprehensive model answers with verified CLI syntax, IaC manifests (YAML/HCL), and point-by-point grading rubrics.
* 🗂️ **Interactive Question Bank (2,500+ Questions)**: Browse, search, filter, and practice curated questions with complete solutions across 18+ DevOps & Cloud domains.
* ✍️ **Interactive Paper Editor**: Modify questions, update marks, rebalance sections, or add custom questions inline.
* 📊 **Platform Analytics & PYQ Intelligence**: Real-time visual metrics on subject question volume, difficulty ratios, and Bloom's taxonomy distributions.
* 📄 **Multi-Format Export**: Export exams to **PDF** (via ReportLab), **Markdown (`.md`)**, **JSON (`.json`)**, or formatted **Clipboard Copy**.

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

### 1. Clone the Repository
```bash
git clone https://github.com/NotHarshhaa/ai-question-paper-generator.git
cd ai-question-paper-generator
```

### 2. Backend Setup
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

### 3. (Optional) Configure Your Preferred LLM Provider
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

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/generate` | `POST` | Generates a structured question paper with Bloom cognitive tagging |
| `/api/evaluate-answer` | `POST` | AI Auto-Grades a student answer using LLM-as-a-Judge (or semantic embeddings fallback) |
| `/api/generate-mcq` | `POST` | Generates 4-option certification MCQs with realistic distractors & explanations |
| `/api/llm/status` | `GET` | Returns active LLM provider, model, and availability status |
| `/api/papers` | `GET` | Retrieves all previously generated papers |
| `/api/papers/<id>` | `GET` | Retrieves details for a specific paper |
| `/api/papers/<id>` | `PUT` | Updates paper content (modified questions, marks, title) |
| `/api/papers/<id>` | `DELETE` | Deletes a paper from history |
| `/api/papers/<id>/solutions` | `GET` | Returns concrete model solutions, code snippets, and grading rubrics |
| `/api/papers/<id>/pdf` | `GET` | Exports the paper as a print-ready PDF |
| `/api/question-bank` | `GET` | Paginated search & filter for 2,500+ PYQ questions |
| `/api/analytics` | `GET` | Aggregated metrics, subject breakdown, and Bloom taxonomy distribution |
| `/api/subjects` | `GET` | Lists all supported subjects |
| `/api/analyze-syllabus` | `POST` | Extracts units and topics from raw syllabus text |
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

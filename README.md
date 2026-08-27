# 🧠 AI-Based DevOps & AWS Question Paper Generator

An intelligent full-stack system that automatically generates **DevOps and AWS certification & university-style question papers** using **NLP and Machine Learning** techniques. Includes an interactive **2,500+ Question Bank**, **Platform Analytics Dashboard**, **Teacher Solution Key Mode**, and **Multi-Format Exporters**.

---

## 🚀 Key Features

* ☁️ **Syllabus-Based Topic Extraction**: Analyzes syllabus units and extracts high-weightage topics using NLTK and TF-IDF.
* 🗂️ **Interactive Question Bank (2,500+ Questions)**: Browse, search, filter, and practice curated PYQ questions with complete model answers across 15+ DevOps & Cloud subject areas.
* 🤖 **AI-Powered Question Generation**: Uses Hugging Face **T5 Transformer** (`valhalla/t5-base-qg-hl`) with smart fallback question pattern engines.
* 🧠 **Semantic Deduplication & Similarity Checking**: Utilizes **BERT / Sentence-Transformers** (`all-MiniLM-L6-v2`) to eliminate redundant questions.
* ⚖️ **Difficulty Balancing**: Calibrates and maintains exact **Easy / Medium / Hard** cognitive difficulty distributions.
* ✍️ **Interactive Paper Editor**: Modify questions, update marks, rebalance sections, or add custom questions inline.
* 🔑 **Teacher Solution Key Mode**: Instantly toggle to view comprehensive model answers, key concepts, and grading criteria for instructors.
* 📊 **Platform Analytics & PYQ Intelligence**: Real-time visual metrics on subject question volume, cognitive difficulty ratios, and top recurring topics.
* 📄 **Multi-Format Export**: Export exams to **PDF** (via ReportLab), **Markdown (`.md`)**, **JSON (`.json`)**, or formatted **Clipboard Copy**.

---

## 🏗️ System Architecture

```
[ Frontend: Next.js + React + Tailwind ] 
                     │  (HTTP / REST API)
                     ▼
[ Backend: Python Flask Server ]
   ├── NLP Layer (NLTK + TF-IDF) ────────► Extracts syllabus units & keywords
   ├── AI Engine (T5 + PYQ Dataset) ─────► Generates contextual candidate questions
   ├── Smart Selector (Sentence-BERT) ───► Eliminates duplicates & balances difficulty
   ├── Paper Structurer ─────────────────► Formats into Section A/B/C or Q1–Q9 layouts
   ├── SQLite Database (papers.db) ──────► Auto-seeds & stores 2,500+ PYQs and papers
   └── PDF Generator (ReportLab) ────────► Renders print-ready formatted PDFs
```

---

## 🧰 Tech Stack

* **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Sonner
* **Backend:** Python 3.11+, Flask, Flask-CORS
* **NLP & Information Retrieval:** NLTK, Scikit-learn (TF-IDF)
* **Machine Learning:** Hugging Face Transformers (T5 Seq2Seq LM), Sentence-Transformers (BERT MiniLM)
* **Database:** SQLite (WAL mode, auto-seeded with 2,500+ questions & solutions)
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
> The backend server will start at `http://127.0.0.1:5000` and automatically seed the database with 2,500+ DevOps PYQs.

### 3. Frontend Setup
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
| `/api/generate` | `POST` | Generates a new structured question paper from syllabus & parameters |
| `/api/papers` | `GET` | Retrieves all previously generated papers |
| `/api/papers/<id>` | `GET` | Retrieves details for a specific paper |
| `/api/papers/<id>` | `PUT` | Updates paper content (modified questions, marks, title) |
| `/api/papers/<id>` | `DELETE` | Deletes a paper from the history |
| `/api/papers/<id>/solutions` | `GET` | Returns model solutions, explanations, and grading rubrics |
| `/api/papers/<id>/pdf` | `GET` | Exports the paper as a print-ready PDF |
| `/api/question-bank` | `GET` | Paginated search & filter for 2,500+ PYQ questions |
| `/api/analytics` | `GET` | Aggregated platform intelligence metrics, subject counts, and difficulty ratios |
| `/api/subjects` | `GET` | Lists all supported subjects |
| `/api/analyze-syllabus` | `POST` | Extracts units and topics from raw syllabus text |

---

## 👨‍💻 Creator

Developed with ❤️ by **[H A R S H H A A](https://github.com/NotHarshhaa)**
* **GitHub:** [@NotHarshhaa](https://github.com/NotHarshhaa)
* **LinkedIn:** [notharshhaa](https://linkedin.com/in/notharshhaa)
* **Email:** [contact@harshhaa.dev](mailto:contact@harshhaa.dev)

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

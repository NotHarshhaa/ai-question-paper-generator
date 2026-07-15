# 🧠 AI-Based DevOps & AWS Question Paper Generator

An intelligent system that automatically generates **DevOps and AWS certification-style question papers** using **NLP and Machine Learning** techniques.

---

## 🚀 Features

* ☁️ DevOps & AWS syllabus-based question generation
* 📊 Previous Year Question (PYQ) pattern analysis
* 🤖 AI-powered question generation (T5)
* 🧠 Question classification & similarity check (BERT)
* ⚖️ Difficulty balancing (Easy / Medium / Hard)
* 📑 Automatic exam paper formatting (Q1–Q9 structure)
* 📄 PDF export support

---

## 🏗️ System Architecture

The system follows a **layered architecture**:

1. **Frontend (User Input)**

   * Subject selection (AWS, Docker, Kubernetes, CI/CD, Terraform, etc.)
   * Syllabus input
   * Exam pattern

2. **Backend (Flask Server)**

   * Handles workflow and API requests

3. **NLP Layer**

   * Tokenization
   * Stopword removal
   * TF-IDF for important topics

4. **Pattern Analysis**

   * Topic frequency from PYQs
   * Domain-wise weightage

5. **AI Engine**

   * T5 → Question generation
   * BERT → Similarity & classification

6. **Smart Selection Engine**

   * Removes duplicates
   * Ensures balanced paper

7. **Paper Structuring**

   * Formats questions into exam pattern

---

## 🧰 Tech Stack

* **Frontend:** Next.js, TypeScript, Tailwind CSS, Shadcn UI
* **Backend:** Flask (Python)
* **NLP:** NLTK, Scikit-learn
* **Machine Learning:** Hugging Face Transformers (T5, BERT)
* **Database:** SQLite
* **PDF Generation:** ReportLab

---

## 📚 Supported Subjects

* AWS Cloud Fundamentals
* AWS Compute (EC2 & Auto Scaling)
* AWS Storage & Databases
* AWS Networking (VPC, Route 53, CloudFront)
* AWS Security & IAM
* AWS Serverless (Lambda, API Gateway, Step Functions)
* Docker & Containerization
* Kubernetes & Container Orchestration
* CI/CD Pipelines
* Jenkins
* Terraform & Infrastructure as Code
* Ansible & Configuration Management
* Linux Administration & Shell Scripting
* Git & Version Control
* Monitoring & Logging (CloudWatch, Prometheus, Grafana)
* Site Reliability Engineering (SRE)
* DevSecOps & Cloud Security
* Microservices Architecture

---

## ⚙️ Installation

```bash
git clone https://github.com/NotHarshhaa/ai-question-paper-generator.git
cd ai-question-paper-generator
pip install -r requirements.txt
```

---

## ▶️ Run the Project

```bash
python app.py
```

Open in browser:

```
http://127.0.0.1:5000
```

---

## 🧠 How It Works

1. User selects a DevOps/AWS subject and inputs syllabus
2. NLP extracts key topics
3. PYQs are analyzed for patterns
4. AI generates questions
5. Smart engine selects best questions
6. Final paper is formatted and exported

---

## 💰 Cost Efficiency

This project uses **pretrained models**, so:

* ❌ No expensive training required
* ✅ Runs on standard CPU
* ✅ Minimal cost

---

## 🎯 Future Improvements

* 🔍 Add MCQ generation
* 🌐 Deploy as web app
* 📊 Analytics dashboard
* 🧾 Multiple exam formats

---

## 📜 License

This project is open-source and available under the MIT License.

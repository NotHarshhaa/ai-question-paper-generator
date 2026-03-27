# 🧠 AI-Based Question Paper Generator

An intelligent system that automatically generates university-style question papers using **NLP and Machine Learning** techniques.

---

## 🚀 Features

* 📘 Syllabus-based question generation
* 📊 Previous Year Paper (PYQ) pattern analysis
* 🤖 AI-powered question generation (T5)
* 🧠 Question classification & similarity check (BERT)
* ⚖️ Difficulty balancing (Easy / Medium / Hard)
* 📑 Automatic exam paper formatting (Q1–Q9 structure)
* 📄 PDF export support

---

## 🏗️ System Architecture

The system follows a **layered architecture**:

1. **Frontend (User Input)**

   * Subject selection
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
   * Unit-wise weightage

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

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Flask (Python)
* **NLP:** NLTK, Scikit-learn
* **Machine Learning:** Hugging Face Transformers (T5, BERT)
* **Database:** SQLite / MongoDB
* **PDF Generation:** ReportLab

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

1. User inputs syllabus
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

## 👨‍🎓 Academic Use

This project is developed as part of a **semester project** and demonstrates the application of:

* Natural Language Processing (NLP)
* Machine Learning
* AI in Education

---

## 📜 License

This project is open-source and available under the MIT License.

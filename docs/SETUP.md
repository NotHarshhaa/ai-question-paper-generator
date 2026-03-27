# Setup Guide - AI Question Paper Generator

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux

# Run the Flask server
python app.py
```

**Backend will run at:** `http://127.0.0.1:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

**Frontend will run at:** `http://localhost:3000`

---

## First Time Setup Notes

### Backend Dependencies

The first time you run the backend, it will:
- Download NLTK data (punkt, stopwords) — ~5MB
- Download T5 model (`valhalla/t5-small-qg-hl`) — ~250MB
- Download BERT model (`sentence-transformers/all-MiniLM-L6-v2`) — ~90MB

**Total download:** ~350MB (one-time only)

These models are cached locally, so subsequent runs will be instant.

### Database

SQLite database will be automatically created at:
```
backend/database/papers.db
```

No manual setup required.

---

## Usage Flow

1. **Open Frontend:** Navigate to `http://localhost:3000`
2. **Click "Generate Paper"** or go to `/generate`
3. **Fill the form:**
   - Enter University Name (optional)
   - Enter Semester (optional)
   - Select Subject
   - Paste your syllabus content
   - Configure exam settings (marks, duration, difficulty)
4. **Click "Generate Paper"**
5. **View the generated paper** with formatted questions
6. **Export as PDF** using the download button

---

## Project Structure

```
ai-question-paper-generator/
├── frontend/                    # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                # Home page
│   │   │   ├── generate/page.tsx       # Paper generation
│   │   │   ├── history/page.tsx        # View all papers
│   │   │   └── paper/[id]/page.tsx     # View single paper
│   │   ├── components/
│   │   │   ├── navbar.tsx              # Navigation
│   │   │   └── ui/                     # Shadcn components
│   │   └── lib/
│   │       └── api.ts                  # API client
│   └── .env.local                      # Frontend config
│
├── backend/                     # Flask API
│   ├── app.py                          # Main Flask app
│   ├── config.py                       # Configuration
│   ├── requirements.txt                # Python deps
│   ├── database/
│   │   └── db.py                       # SQLite operations
│   ├── utils/
│   │   ├── nlp_processor.py            # NLP: TF-IDF, topics
│   │   ├── ai_engine.py                # T5 + BERT models
│   │   ├── smart_selector.py           # Dedup + balancing
│   │   ├── paper_structurer.py         # Paper formatting
│   │   └── pdf_generator.py            # PDF export
│   └── .env                            # Backend config
│
└── README.md                    # Project documentation
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate` | Generate question paper |
| `GET` | `/api/papers` | List all papers |
| `GET` | `/api/papers/:id` | Get specific paper |
| `DELETE` | `/api/papers/:id` | Delete paper |
| `GET` | `/api/papers/:id/pdf` | Export as PDF |
| `GET` | `/api/subjects` | List subjects |
| `POST` | `/api/analyze-syllabus` | Analyze syllabus |
| `GET` | `/api/health` | Health check |

---

## Configuration

### Backend (.env)

```env
T5_MODEL_NAME=valhalla/t5-small-qg-hl
BERT_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
FLASK_HOST=127.0.0.1
FLASK_PORT=5000
FLASK_DEBUG=true
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000/api
```

---

## Troubleshooting

### Backend Issues

**Issue:** Models not downloading
- **Solution:** Ensure stable internet connection. Models download on first run.

**Issue:** Port 5000 already in use
- **Solution:** Change `FLASK_PORT` in `.env` to another port (e.g., 5001)

**Issue:** NLTK data not found
- **Solution:** Run `python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"`

### Frontend Issues

**Issue:** API connection failed
- **Solution:** Ensure backend is running at `http://127.0.0.1:5000`
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`

**Issue:** Build errors
- **Solution:** Delete `node_modules` and `.next`, then run `npm install` again

---

## Production Deployment

### Backend (Flask)

Use a production WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend (Next.js)

Build and start:

```bash
npm run build
npm start
```

Or deploy to Vercel/Netlify for automatic deployment.

---

## System Requirements

- **Python:** 3.10+
- **Node.js:** 18+
- **RAM:** 2GB minimum (4GB recommended for model loading)
- **Disk:** 500MB for models + dependencies
- **OS:** Windows, macOS, Linux

---

## Features Implemented

✅ Syllabus-based question generation  
✅ NLP topic extraction (TF-IDF)  
✅ AI question generation (T5)  
✅ Similarity detection (BERT)  
✅ Difficulty balancing (Easy/Medium/Hard)  
✅ Multiple exam patterns (Standard, Sections, Choice)  
✅ PDF export (ReportLab)  
✅ SQLite database  
✅ Modern UI (Next.js + Shadcn)  
✅ Responsive design  
✅ Paper history management  

---

## Support

For issues or questions:
- Check the main `README.md`
- Review this setup guide
- Ensure all dependencies are installed
- Verify both frontend and backend are running

---

**Happy Question Paper Generating! 🎓📝**

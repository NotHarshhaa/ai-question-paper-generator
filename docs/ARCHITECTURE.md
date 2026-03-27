# System Architecture

## Overview

The AI Question Paper Generator follows a **client-server architecture** with a clear separation between the frontend (Next.js) and backend (Flask).

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Home Page   │  │  Generate    │  │   History    │       │
│  │              │  │    Form      │  │    List      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           API Client (lib/api.ts)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/REST
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Flask)                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Flask Routes (app.py)                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                      │                                      │
│         ┌────────────┼────────────┐                         │
│         ▼            ▼            ▼                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │   NLP    │ │    AI    │ │  Smart   │                     │
│  │Processor │ │  Engine  │ │ Selector │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
│         │            │            │                         │
│         └────────────┼────────────┘                         │
│                      ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Paper Structurer                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                      │                                      │
│         ┌────────────┼────────────┐                         │
│         ▼            ▼            ▼                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ Database │ │   PDF    │ │  Models  │                     │
│  │ (SQLite) │ │Generator │ │  Cache   │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Frontend Layer (Next.js)

**Technology:** Next.js 16, React, TypeScript, Tailwind CSS, Shadcn UI

**Responsibilities:**
- User interface and interaction
- Form validation
- API communication
- State management
- Routing

**Key Pages:**
- `/` — Landing page with features
- `/generate` — Multi-step form for paper generation
- `/history` — List of generated papers
- `/paper/[id]` — View and export individual papers

---

### 2. Backend Layer (Flask)

**Technology:** Flask, Python 3.10+

**Responsibilities:**
- API endpoints
- Request validation
- Orchestration of NLP and AI components
- Database operations
- PDF generation

**API Endpoints:**
- `POST /api/generate` — Generate paper
- `GET /api/papers` — List papers
- `GET /api/papers/:id` — Get paper details
- `DELETE /api/papers/:id` — Delete paper
- `GET /api/papers/:id/pdf` — Export PDF

---

### 3. NLP Layer

**File:** `utils/nlp_processor.py`

**Technology:** NLTK, Scikit-learn

**Responsibilities:**
- Tokenization and stopword removal
- Topic extraction from syllabus
- Unit mapping
- TF-IDF analysis for important topics

**Key Methods:**
- `extract_topics()` — Extract topics from syllabus
- `extract_units()` — Identify syllabus units
- `get_important_topics()` — Rank topics by TF-IDF
- `map_topics_to_units()` — Map topics to units

---

### 4. AI Engine

**File:** `utils/ai_engine.py`

**Technology:** Hugging Face Transformers (T5, BERT)

**Models:**
- **T5** (`valhalla/t5-small-qg-hl`) — Question generation
- **BERT** (`sentence-transformers/all-MiniLM-L6-v2`) — Similarity detection

**Responsibilities:**
- Generate questions from topics
- Compute question similarity
- Classify question difficulty

**Key Methods:**
- `generate_questions()` — Generate questions using T5
- `compute_similarity()` — Calculate semantic similarity
- `classify_difficulty()` — Classify as easy/medium/hard

---

### 5. Smart Selector

**File:** `utils/smart_selector.py`

**Responsibilities:**
- Remove duplicate questions (using BERT similarity)
- Balance difficulty distribution
- Select optimal question set

**Key Methods:**
- `remove_duplicates()` — Filter similar questions
- `balance_difficulty()` — Ensure proper difficulty mix
- `select_questions()` — Final question selection

---

### 6. Paper Structurer

**File:** `utils/paper_structurer.py`

**Responsibilities:**
- Format questions into exam structure
- Assign marks to questions
- Create sections (A, B, C)
- Handle different exam patterns

**Exam Patterns:**
- **Standard** — Single section, all questions
- **Sections** — Multiple sections (short, medium, long)
- **Choice** — Internal choice questions

---

### 7. PDF Generator

**File:** `utils/pdf_generator.py`

**Technology:** ReportLab

**Responsibilities:**
- Generate professional PDF output
- Format header, sections, questions
- Add university branding
- Include marks and instructions

---

### 8. Database Layer

**File:** `database/db.py`

**Technology:** SQLite

**Schema:**
```sql
CREATE TABLE papers (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    university_name TEXT,
    semester TEXT,
    syllabus TEXT,
    exam_pattern TEXT,
    total_marks INTEGER,
    duration_minutes INTEGER,
    num_questions INTEGER,
    difficulty_distribution TEXT,  -- JSON
    questions TEXT,                 -- JSON
    sections TEXT,                  -- JSON
    syllabus_topics TEXT,           -- JSON
    created_at TEXT
);
```

---

## Data Flow

### Paper Generation Flow

```
1. User Input (Frontend)
   ↓
2. API Request → /api/generate
   ↓
3. NLP Processing
   - Extract topics
   - Identify units
   - Rank by TF-IDF
   ↓
4. AI Question Generation
   - T5 generates questions per topic
   - BERT classifies difficulty
   ↓
5. Smart Selection
   - Remove duplicates (BERT similarity)
   - Balance difficulty distribution
   ↓
6. Paper Structuring
   - Format into sections
   - Assign marks
   ↓
7. Database Storage
   - Save paper to SQLite
   ↓
8. Response → Frontend
   - Display formatted paper
   ↓
9. PDF Export (on demand)
   - Generate PDF with ReportLab
```

---

## Technology Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React, TypeScript |
| UI Framework | Tailwind CSS, Shadcn UI |
| Backend | Flask, Python 3.10+ |
| NLP | NLTK, Scikit-learn |
| AI Models | T5 (question gen), BERT (similarity) |
| Database | SQLite |
| PDF | ReportLab |
| HTTP Client | Fetch API |

---

## Scalability Considerations

### Current Architecture
- Single-server deployment
- In-memory model loading
- SQLite for persistence

### Future Improvements
- **Horizontal Scaling:** Add load balancer + multiple Flask instances
- **Model Serving:** Separate model server (TensorFlow Serving / TorchServe)
- **Database:** Migrate to PostgreSQL for production
- **Caching:** Redis for frequently accessed papers
- **Queue:** Celery for async question generation
- **CDN:** Static asset delivery for frontend

---

## Security

- **CORS:** Configured for localhost development
- **Input Validation:** All API inputs validated
- **SQL Injection:** Parameterized queries used
- **XSS Protection:** React auto-escapes output
- **File Upload:** Not implemented (security risk avoided)

---

## Performance

- **Model Loading:** ~2-3 seconds on first request
- **Question Generation:** ~5-10 seconds for 9 questions
- **PDF Generation:** ~1 second
- **Database Queries:** <100ms

---

This architecture provides a solid foundation for an academic project while being extensible for production use.

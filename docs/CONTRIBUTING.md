# Contributing to AI Question Paper Generator

## Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Local Development

1. **Fork and clone the repository**
```bash
git clone https://github.com/your-username/ai-question-paper-generator.git
cd ai-question-paper-generator
```

2. **Set up backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
```

3. **Set up frontend**
```bash
cd frontend
npm install
```

## Code Structure

### Backend Architecture

```
backend/
├── app.py                    # Flask routes and main app
├── config.py                 # Configuration management
├── database/
│   └── db.py                 # SQLite operations
└── utils/
    ├── nlp_processor.py      # NLP: tokenization, TF-IDF
    ├── ai_engine.py          # T5 + BERT model integration
    ├── smart_selector.py     # Question deduplication & balancing
    ├── paper_structurer.py   # Paper formatting logic
    └── pdf_generator.py      # PDF generation with ReportLab
```

### Frontend Architecture

```
frontend/src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── generate/page.tsx     # Paper generation form
│   ├── history/page.tsx      # Paper history
│   └── paper/[id]/page.tsx   # Paper detail view
├── components/
│   ├── navbar.tsx            # Navigation component
│   └── ui/                   # Shadcn UI components
└── lib/
    ├── api.ts                # API client functions
    └── utils.ts              # Utility functions
```

## Adding New Features

### Adding a New Question Type

1. Update `_classify_question_type()` in `backend/app.py`
2. Add UI badge styling in `frontend/src/app/paper/[id]/page.tsx`

### Adding a New Exam Pattern

1. Add pattern logic in `backend/utils/paper_structurer.py`
2. Update pattern options in `frontend/src/app/generate/page.tsx`

### Adding a New Subject

1. Add to subjects list in `backend/app.py` (`list_subjects()`)
2. Add to subjects array in `frontend/src/app/generate/page.tsx`

## Testing

### Backend Tests
```bash
cd backend
pytest  # (after adding test files)
```

### Frontend Tests
```bash
cd frontend
npm test  # (after adding test files)
```

## Code Style

### Python
- Follow PEP 8
- Use type hints where possible
- Add docstrings for functions

### TypeScript/React
- Use functional components
- Follow React hooks best practices
- Use TypeScript strict mode

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a PR
6. Wait for review

## Reporting Issues

When reporting bugs, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment (OS, Python/Node version)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

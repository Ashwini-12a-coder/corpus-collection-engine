# My Culture Vault — Corpus Collection Engine (FastAPI + SQLite + PWA)

An offline-first, multilingual-friendly web app that collects high-quality, culturally rich text data as 10-question micro-interviews. Built with a static frontend (HTML/CSS/JS) and a Python FastAPI backend.

## Features
- Categories: Stories, Festivals, Elder's Advice, Place-based Facts
- Fetch 10 dynamic questions per category from the backend
- Users answer and submit; data saved to SQLite
- Offline-first PWA: cache assets and queue submissions while offline
- Simple i18n strings for EN/HI/TE on the frontend
- Export collected corpus as JSON
- Open license consent checkbox

## Quickstart

### 1) Install tools
- **VS Code** + extensions: *Python*, *Pylance*, *EditorConfig for VS Code* (optional)
- **Python 3.10+**

### 2) Create & activate venv (recommended)
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
```

### 3) Install backend deps
```bash
pip install -r backend/requirements.txt
```

### 4) Initialize database with default questions
```bash
python -m backend.seed_questions
```

### 5) Run the app
```bash
uvicorn backend.main:app --reload
```
Open http://127.0.0.1:8000 in your browser.

> The FastAPI app serves the frontend at `/` and exposes APIs under `/api/*`.

### 6) Export data
Visit `http://127.0.0.1:8000/api/export/json` to download all submissions as `export.json`.

## Project Structure
```
corpus-collection-engine/
├─ backend/
│  ├─ main.py            # FastAPI app + static serving
│  ├─ db.py              # SQLAlchemy models + engine
│  ├─ seed_questions.py  # Seeds 10 Q per category
│  └─ requirements.txt
├─ frontend/
│  ├─ index.html
│  ├─ styles.css
│  ├─ app.js
│  ├─ i18n.js
│  ├─ manifest.json
│  └─ service-worker.js
└─ README.md
```

## Notes for low-bandwidth areas
- Frontend cached via Service Worker (installable PWA)
- Submissions queue locally if offline and auto-sync when back online
- Keep assets tiny; avoid heavy libraries on the frontend

## Open-source & licensing
- Consider adding a `LICENSE` (e.g., MIT) and `CONTRIBUTING.md`
- Mark dataset outputs as CC BY 4.0 in your REPORT.md

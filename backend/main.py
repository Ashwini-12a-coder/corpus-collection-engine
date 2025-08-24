from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func
import os

from db import SessionLocal, init_db, Question, Submission

APP_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(os.path.dirname(APP_DIR), 'frontend')

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AnswerIn(BaseModel):
    question_id: int
    answer_text: str = Field(min_length=1)

class SubmitIn(BaseModel):
    category: str
    participant_name: Optional[str] = None
    participant_lang: Optional[str] = None
    answers: List[AnswerIn]

app = FastAPI(title="Corpus Collection Engine", version="1.0.0")

# CORS for local dev + HF Spaces
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health():
    return {"ok": True}

@app.get("/api/categories")
def categories():
    return {"categories": ["stories", "festivals", "food", "arts", "games_sports", "language_proverbs", "music_dance"]}

@app.get("/api/questions")
def get_questions(category: str, db: Session = Depends(get_db)):
    stmt = select(Question).where(Question.category == category).limit(10)
    res = db.execute(stmt).scalars().all()
    return {"questions": [{"id": q.id, "text": q.text, "language": q.language} for q in res]}

@app.post("/api/submit")
def submit(payload: SubmitIn, request: Request, db: Session = Depends(get_db)):
    sub = Submission(
        category=payload.category,
        participant_name=payload.participant_name,
        participant_lang=payload.participant_lang,
        answers=[a.model_dump() for a in payload.answers],
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return {"status":"ok", "submission_id": sub.id}

@app.get("/api/metrics")
def metrics(db: Session = Depends(get_db)):
    total_subs = db.query(func.count(Submission.id)).scalar()
    total_answers = sum(len(s.answers or []) for s in db.query(Submission).all())
    return {"submissions": total_subs, "answers": total_answers}

@app.get("/api/export/json")
def export_json(db: Session = Depends(get_db)):
    subs = db.query(Submission).all()
    payload = [
        {
            "id": s.id,
            "category": s.category,
            "participant_name": s.participant_name,
            "participant_lang": s.participant_lang,
            "answers": s.answers,
            "created_at": s.created_at.isoformat()
        } for s in subs
    ]
    # Write temp file
    path = os.path.join(APP_DIR, "export.json")
    with open(path, "w", encoding="utf-8") as f:
        import json
        json.dump(payload, f, ensure_ascii=False, indent=2)
    return FileResponse(path, media_type="application/json", filename="export.json")
# Serve static frontend
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
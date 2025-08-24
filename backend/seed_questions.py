import json
from db import SessionLocal, Question, init_db

def seed(lang='any'):
    init_db()
    with open("questions.json", "r", encoding="utf-8") as f:
        categories = json.load(f)

    db = SessionLocal()
    for cat, qs in categories.items():
        for text in qs:
            q = Question(category=cat, language=lang, text=text)
            db.add(q)
    db.commit()
    db.close()

if __name__ == "__main__":
    seed()

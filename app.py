from datetime import datetime
from flask import Flask, request, jsonify, redirect
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
import os


# Serve the user's frontend from ./public
app = Flask(__name__, static_folder='public', static_url_path='')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///culture_vault.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ---------- Models ----------
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), nullable=False, unique=True)
    location = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Session(db.Model):
    __tablename__ = 'sessions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    finished_at = db.Column(db.DateTime, nullable=True)

class Answer(db.Model):
    __tablename__ = 'answers'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    step_index = db.Column(db.Integer, nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# after db = SQLAlchemy(app)

# Ensure database tables are created at startup
with app.app_context():
    db.create_all()


# ---------- API ----------
@app.post('/api/login')
def api_login():
    data = request.get_json(force=True)
    username = (data.get('username') or '').strip()
    location = (data.get('location') or '').strip()
    if not username:
        return jsonify({'error': 'username required'}), 400

    user = User.query.filter(func.lower(User.username) == username.lower()).first()
    if not user:
        user = User(username=username, location=location)
        db.session.add(user)
    else:
        # update latest location if provided
        if location:
            user.location = location
    db.session.commit()

    return jsonify({'user_id': user.id, 'username': user.username})

@app.post('/api/answers/start')
def api_start_session():
    data = request.get_json(force=True)
    user_id = data.get('user_id')
    category = data.get('category')
    if not user_id or not category:
        return jsonify({'error': 'user_id and category required'}), 400

    s = Session(user_id=user_id, category=category)
    db.session.add(s)
    db.session.commit()
    return jsonify({'session_id': s.id})

@app.post('/api/answers/append')
def api_append_answer():
    data = request.get_json(force=True)
    session_id = data.get('session_id')
    step_index = data.get('step_index')
    question = data.get('question')
    answer = data.get('answer')
    if session_id is None or step_index is None or not question or not answer:
        return jsonify({'error': 'session_id, step_index, question, answer required'}), 400

    a = Answer(session_id=session_id, step_index=step_index, question=question, answer=answer)
    db.session.add(a)
    db.session.commit()
    return jsonify({'ok': True, 'answer_id': a.id})

@app.post('/api/answers/finish')
def api_finish_session():
    data = request.get_json(force=True)
    session_id = data.get('session_id')
    if not session_id:
        return jsonify({'error': 'session_id required'}), 400
    s = Session.query.get(session_id)
    if not s:
        return jsonify({'error': 'session not found'}), 404
    s.finished_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'ok': True})

# Optional helper: list my sessions + answers
@app.get('/api/me/sessions')
def api_my_sessions():
    # Very simple: identify by username header for demo
    username = request.args.get('username', '').strip()
    if not username:
        return jsonify([])
    user = User.query.filter(func.lower(User.username) == username.lower()).first()
    if not user:
        return jsonify([])

    sessions = Session.query.filter_by(user_id=user.id).order_by(Session.started_at.desc()).all()
    out = []
    for s in sessions:
        answers = Answer.query.filter_by(session_id=s.id).order_by(Answer.step_index.asc()).all()
        out.append({
            'session_id': s.id,
            'category': s.category,
            'started_at': s.started_at.isoformat(),
            'finished_at': s.finished_at.isoformat() if s.finished_at else None,
            'answers': [{'step_index': a.step_index, 'question': a.question, 'answer': a.answer} for a in answers]
        })
    return jsonify(out)

# ---------- Static frontend ----------
@app.get('/')
def home():
    return redirect('/intra.html', code=302)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))   # Hugging Face needs 7860
    app.run(host='0.0.0.0', port=port, debug=True)

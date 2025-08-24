const API_BASE = '/api';

let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-block';
});
installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt = null;
    installBtn.style.display = 'none';
  }
});

const netStatus = document.getElementById('netStatus');
const statusDot = document.getElementById('statusDot');
function updateOnlineStatus() {
  const online = navigator.onLine;
  netStatus.textContent = online ? 'Online' : 'Offline-first ready. Submissions will sync when online.';
  statusDot.classList.toggle('online', online);
  statusDot.classList.toggle('offline', !online);
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// Simple 15-minute countdown
let remaining = 15 * 60;
const timerEl = document.getElementById('timer');
setInterval(() => {
  if (remaining <= 0) return;
  remaining -= 1;
  const m = String(Math.floor(remaining / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');
  timerEl.textContent = `${m}:${s}`;
}, 1000);

const formEl = document.getElementById('qaForm');
const loadBtn = document.getElementById('loadBtn');
const submitBtn = document.getElementById('submitBtn');
const agreeCheck = document.getElementById('agreeCheck');
const msgEl = document.getElementById('msg');
const categoryEl = document.getElementById('category');

agreeCheck.addEventListener('change', () => {
  submitBtn.disabled = !agreeCheck.checked;
});

document.getElementById('exportLocal').addEventListener('click', () => {
  const unsent = JSON.parse(localStorage.getItem('unsent_submissions') || '[]');
  const blob = new Blob([JSON.stringify(unsent, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'unsent_submissions.json';
  a.click();
  URL.revokeObjectURL(url);
});

let questionsCache = [];

async function fetchQuestions() {
  const cat = categoryEl.value;
  const res = await fetch(`${API_BASE}/questions?category=${encodeURIComponent(cat)}`);
  if (!res.ok) throw new Error('Failed to load questions');
  const data = await res.json();
  questionsCache = data.questions || [];
  renderQuestions(questionsCache);
}

function renderQuestions(questions) {
  formEl.innerHTML = '';
  questions.forEach((q, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'qa-item';
    wrap.innerHTML = `
      <h4>${idx + 1}. ${q.text}</h4>
      <textarea class="textarea" name="q_${q.id}" placeholder="Type your answer..." required></textarea>
    `;
    formEl.appendChild(wrap);
  });
}

loadBtn.addEventListener('click', async () => {
  try {
    await fetchQuestions();
    msgEl.textContent = '';
  } catch (e) {
    msgEl.textContent = e.message;
  }
});

submitBtn.addEventListener('click', async () => {
  if (!agreeCheck.checked) return;
  const participantName = document.getElementById('participantName').value.trim();
  const participantLang = document.getElementById('participantLang').value.trim();
  const cat = categoryEl.value;

  // Collect answers
  const payload = {
    category: cat,
    participant_name: participantName || null,
    participant_lang: participantLang || null,
    answers: questionsCache.map(q => ({
      question_id: q.id,
      answer_text: (formEl.querySelector(`[name="q_${q.id}"]`) || {}).value || ""
    }))
  };

  try {
    const res = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Submission failed');
    const data = await res.json();
    msgEl.textContent = `Thanks! Submission ID: ${data.submission_id}`;
    formEl.reset();
  } catch (err) {
    // Offline fallback: store locally
    const unsent = JSON.parse(localStorage.getItem('unsent_submissions') || '[]');
    unsent.push({ ts: Date.now(), payload });
    localStorage.setItem('unsent_submissions', JSON.stringify(unsent));
    msgEl.textContent = 'Saved locally (offline). Will sync when online.';
  }
});

// Background sync attempt every 30s
setInterval(async () => {
  if (!navigator.onLine) return;
  const unsent = JSON.parse(localStorage.getItem('unsent_submissions') || '[]');
  if (!unsent.length) return;
  const next = unsent[0];
  try {
    const res = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next.payload)
    });
    if (res.ok) {
      unsent.shift();
      localStorage.setItem('unsent_submissions', JSON.stringify(unsent));
    }
  } catch {}
}, 30000);

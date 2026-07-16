<div align="center">

# ☁️ Cloud Ascent

### A gamified study platform for the **Google Associate Cloud Engineer (ACE)** certification

Learn every exam domain from first principles, then drill it through nine game modes,
an adaptive mistake engine, and a realistic exam simulator — with optional accounts,
cloud progress sync, and a global leaderboard.

</div>

---

## ✨ Features

**Learn**
- 10 exam modules (Fundamentals · Compute Engine · App Platforms · Storage · Databases · Networking · IAM & Org · Operations · Messaging & Data · Tooling)
- Concept pages: purpose, why it exists, how it works, real example, ⭐ exam tips, ⚠ traps, when-not-to-use
- Interactive **service comparison** tables (the pairs the ACE loves to test)
- **High-Yield** mode — the most frequently tested topics, flagged ★ throughout

**Play — 9 game modes**
- Quiz Arena (adaptive difficulty, timed option, streaks) · Speed Round · Flashcards (spaced repetition)
- Match & Drag · Memory Match · Scenario Challenge · Architecture Builder · Cloud Detective · Cost Optimizer

**Exam**
- **Boss Battle** — 50-question adaptive gauntlet
- **ACE Exam Simulator** — configurable length + timer, flag/skip/return, review before submit, domain breakdown, pass-probability

**Track & adapt**
- Mistake Notebook (misconception, chosen distractor, repeat count) · adaptive revision · SRS scheduling
- Insights dashboard: accuracy, avg response time, per-module mastery, improvement chart, **ACE readiness %**
- XP, levels, achievements, light/dark themes

**Cloud (optional)** — accounts, cross-device progress sync, and a global leaderboard via the backend API.

---

## 🏗 Architecture

```
┌────────────────────────────┐        ┌──────────────────────────────┐
│  Frontend (static)         │  HTTPS │  Backend API (Node/Express)   │
│  index.html + vanilla JS   │◄──────►│  /api/auth  /api/progress     │
│  localStorage (offline)    │ cookie │  /api/leaderboard             │
│  optional sync.js layer    │  +CSRF │  better-sqlite3 (WAL)         │
└────────────────────────────┘        └──────────────────────────────┘
```

- The **frontend works fully offline** with `localStorage`. No backend required.
- The **backend is optional** and only powers accounts, sync, and the leaderboard.
- No build step, no framework — plain HTML/CSS/JS on the frontend; a small Express app on the backend.

```
cloud-ascent-ace/
├─ frontend/
│  ├─ index.html          # the entire app (self-contained)
│  └─ js/
│     ├─ config.js        # where to find the API (optional)
│     └─ sync.js          # optional cloud-sync + leaderboard layer
├─ backend/
│  ├─ src/
│  │  ├─ server.js        # Express app + security wiring
│  │  ├─ config.js        # env-driven config (fails closed in prod)
│  │  ├─ db.js            # SQLite, prepared statements only
│  │  ├─ middleware/security.js  # helmet, rate limit, CSRF, JWT session
│  │  └─ routes/          # auth.js, progress.js
│  └─ .env.example
├─ Dockerfile             # single image: API + static frontend
├─ docker-compose.yml
└─ .github/workflows/     # Pages deploy + CI
```

---

## 🚀 Quick start

> 📘 **New here? Follow the step-by-step [INSTALL.md](INSTALL.md)** — prerequisites,
> every run option, verification, and troubleshooting in one place.

### ⭐ Easiest — one command (full stack)
```bash
./start.sh        # macOS / Linux
.\start.ps1       # Windows (PowerShell)
# open http://localhost:8080
```
Generates a local session secret on first run, installs deps, and serves the app.

### Option A — frontend only (zero setup)
```bash
cd frontend
python3 -m http.server 5173      # or any static server
# open http://localhost:5173
```
Everything works; progress is saved in your browser.

### Option B — full stack (accounts + sync + leaderboard)
```bash
cd backend
cp .env.example .env
# generate a strong secret and paste it into .env as JWT_SECRET:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm install
SERVE_FRONTEND=1 npm start
# open http://localhost:8080  (API + frontend on one origin)
```

### Option C — Docker
```bash
export JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
docker compose up --build
# open http://localhost:8080
```

---

## 🌐 Deploy

**Frontend → GitHub Pages** (free): enable *Settings → Pages → Source: GitHub Actions*.
The included workflow publishes `frontend/` on every push to `main`.

**Backend → any Node host** (Render, Fly.io, Railway, a VM, etc.):
- Set `NODE_ENV=production`, a strong `JWT_SECRET`, and `CORS_ORIGINS=https://<your-username>.github.io`.
- Then point the frontend at it: open the app → **☁︎ button → set API origin**, or edit `frontend/js/config.js`.

> When frontend and backend are on **different origins**, the session cookie is cross-site.
> Serve the backend over HTTPS (so `Secure` cookies work) and keep `CORS_ORIGINS` tight.

---

## 🔒 Security

Built secure-by-default:

| Area | Measure |
|---|---|
| Passwords | bcrypt (cost 12); never logged or returned |
| Sessions | JWT in `HttpOnly` + `Secure` + `SameSite` cookie; fresh id per login |
| SQL | `better-sqlite3` **prepared statements only** — no string-built queries |
| Input | `zod` schemas with `.strict()` (unknown-field rejection, size caps) |
| CSRF | double-submit token on all state-changing routes |
| Headers | `helmet` CSP, HSTS, nosniff, frame-deny, referrer-policy |
| Rate limiting | per-IP general + stricter auth limiter |
| Secrets | environment only; server **refuses to boot** in prod without a strong `JWT_SECRET` |
| Errors | generic to clients; details logged server-side |
| Enumeration | login/register return generic messages; uniform timing |

> The default rate-limit store is in-memory (fine for a single instance). For
> multi-instance production, back it with Redis (`rate-limit-redis`) and keep it
> failing **closed**.

---

## 🗺 Roadmap
- Expand the question bank (community PRs welcome — see `frontend/index.html` `Q[]`)
- Optional email verification & password reset
- Per-domain timed mocks matching the official exam blueprint weighting

## 🤝 Contributing
Issues and PRs welcome — especially new, original practice questions with full
explanations and per-option rationale. Please keep questions original (do not paste
copyrighted exam dumps).

## 📄 License
MIT — see [LICENSE](LICENSE). Independent study aid, **not affiliated with Google**.
"Google Cloud" and "Associate Cloud Engineer" are trademarks of Google LLC.

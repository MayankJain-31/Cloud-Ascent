# Installing & Running Cloud Ascent Locally

This guide gets **Cloud Ascent** running on your own machine (`http://localhost:8080`).
No prior experience needed — copy/paste the commands for your setup.

The app has two parts:

- **Frontend** — the study app itself. Runs in your browser. Works 100% offline.
- **Backend** *(optional)* — a small API that adds **accounts, cross-device progress
  sync, and a global leaderboard**. Only needed if you want those features.

You can run **just the frontend** (zero setup) or the **full stack** (frontend + backend).

---

## 1. Prerequisites

| To run… | You need |
|---|---|
| Frontend only | Any static file server (Python is pre-installed on macOS/Linux), **or** Node.js |
| Full stack (recommended) | **Node.js 18+** and **npm** |
| Docker option | **Docker Desktop** |

Check what you have:
```bash
node -v      # should print v18.x or higher
npm -v
```
Don't have Node? Install the LTS from <https://nodejs.org> (includes npm), or use
[nvm](https://github.com/nvm-sh/nvm).

---

## 2. Get the code
```bash
git clone https://github.com/<username>/cloud-ascent-ace.git
cd cloud-ascent-ace
```
(Or download the ZIP from GitHub → *Code → Download ZIP* and unzip it.)

---

## 3. Run it — pick ONE option

### ⭐ Option A — Full stack, one command (recommended)

**macOS / Linux:**
```bash
./start.sh
```

**Windows (PowerShell):**
```powershell
.\start.ps1
```

The script will:
1. check Node.js is installed,
2. install backend dependencies the first time,
3. create `backend/.env` with a **freshly generated** session secret (kept local, never committed),
4. start the server serving the app.

When you see `Cloud Ascent API on :8080`, open:
> **http://localhost:8080**

Stop it with **Ctrl + C**.

---

### Option B — Full stack, manual steps
```bash
cd backend
cp .env.example .env
# generate a strong secret and paste it into .env as JWT_SECRET=...
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm install
SERVE_FRONTEND=1 npm start
```
Open **http://localhost:8080**.

---

### Option C — Frontend only (no backend, no Node build)
The app is fully usable offline; you just won't have accounts/leaderboard.
```bash
cd frontend
python3 -m http.server 5173      # macOS/Linux
#   (Windows)  py -m http.server 5173
#   (or, with Node)  npx serve -l 5173 .
```
Open **http://localhost:5173**.

> ⚠️ Don't open `index.html` by double-clicking it (`file://`). Browsers block the
> `js/*.js` files over `file://`. Always use a local server as shown above.

---

### Option D — Docker
```bash
export JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
docker compose up --build
```
Open **http://localhost:8080**. Stop with **Ctrl + C** (data persists in a Docker volume).

---

## 4. Verify it works
- Visiting **http://localhost:8080** shows the dashboard, left sidebar, and game modes.
- Health check: <http://localhost:8080/api/health> returns `{"ok":true,...}` (full stack only).
- Click the **☁︎** button (top-right) → register an account → your progress now syncs
  and the leaderboard populates (full stack only).

---

## 5. Troubleshooting

**The page is blank / only the top bar shows.**
Hard-refresh to clear the cache: **Cmd + Shift + R** (macOS) / **Ctrl + Shift + R** (Windows/Linux).
If still blank, the server may have stopped — re-run `./start.sh` and confirm
`http://localhost:8080/api/health` responds.

**`Port 8080 already in use`.**
Run on a different port:
```bash
PORT=8090 SERVE_FRONTEND=1 npm start     # then open http://localhost:8090
```
If you change the port, also set `CORS_ORIGINS` to match (e.g. `http://localhost:8090`).

**`better-sqlite3` fails to install / build.**
It compiles a native module and needs build tools:
- **macOS:** `xcode-select --install`
- **Debian/Ubuntu:** `sudo apt-get install -y python3 make g++`
- **Windows:** install [Node.js](https://nodejs.org) with the "Tools for Native Modules"
  checkbox ticked, then re-run `npm install`.

**"Cloud sync not configured" in the ☁︎ dialog.**
That's expected when running **frontend-only** (Option C) — there's no backend. Use
Option A/B/D for accounts, or paste your API origin into that dialog.

**Sign-in doesn't persist after restarting the backend.**
Make sure `backend/.env` has a fixed `JWT_SECRET` (Option A/B do this). Without one in
development, a temporary secret is generated each run, which invalidates old sessions.

---

## 6. Security notes (for self-hosting beyond localhost)
- Never commit `backend/.env`. It's git-ignored by default.
- In production (`NODE_ENV=production`) the server **refuses to start** without a strong
  `JWT_SECRET` — this is intentional.
- If you expose the backend on the internet, serve it over **HTTPS**, set
  `CORS_ORIGINS` to your exact site origin, and consider a Redis-backed rate limiter
  (see `backend/README.md`).

---

Questions or issues? Open an issue on the GitHub repo.

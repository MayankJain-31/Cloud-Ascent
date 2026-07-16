#!/usr/bin/env bash
# Cloud Ascent — one-command local launcher (macOS / Linux).
# Starts the backend serving the frontend at http://localhost:PORT (default 8080).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT/backend"

# 1) Require Node.js 18+
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is not installed. Install the LTS from https://nodejs.org and re-run."
  exit 1
fi
MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$MAJOR" -lt 18 ]; then
  echo "❌ Node.js 18+ required (found $(node -v)). Please upgrade."
  exit 1
fi

PORT="${PORT:-8080}"

# 2) Create backend/.env with a freshly generated secret if it doesn't exist.
#    The secret is generated with a CSPRNG and stays local (backend/.env is git-ignored).
if [ ! -f .env ]; then
  echo "→ First run: creating backend/.env with a generated session secret…"
  SECRET="$(node -e 'console.log(require("crypto").randomBytes(48).toString("hex"))')"
  umask 077
  {
    echo "NODE_ENV=development"
    echo "PORT=${PORT}"
    echo "JWT_SECRET=${SECRET}"
    echo "CORS_ORIGINS=http://localhost:${PORT}"
    echo "DB_PATH=./data/cloud-ascent.db"
    echo "SERVE_FRONTEND=1"
  } > .env
  unset SECRET
  echo "  ✓ backend/.env created (do not commit this file)."
fi

# 3) Install dependencies the first time.
if [ ! -d node_modules ]; then
  echo "→ Installing backend dependencies (first run only)…"
  npm install --omit=dev
fi

# 4) Launch.
echo ""
echo "🚀 Starting Cloud Ascent — open http://localhost:${PORT}"
echo "   (press Ctrl+C to stop)"
echo ""
SERVE_FRONTEND=1 PORT="${PORT}" npm start

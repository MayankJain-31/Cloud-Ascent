# Cloud Ascent — Backend API

Small, secure Express API providing **accounts, progress sync, and a global
leaderboard** for the Cloud Ascent frontend. SQLite storage, no external services.

## Run
```bash
cp .env.example .env      # set a strong JWT_SECRET (see below)
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm install
npm run dev               # auto-reload
# or: SERVE_FRONTEND=1 npm start   # also serves ../frontend at /
```

## Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| GET  | `/api/health` | – | Liveness probe |
| GET  | `/api/csrf` | – | Issues the CSRF token (double-submit) |
| POST | `/api/auth/register` | – | Create account `{email, password, handle?}` |
| POST | `/api/auth/login` | – | Sign in `{email, password}` |
| POST | `/api/auth/logout` | cookie | Clear session |
| GET  | `/api/auth/me` | cookie | Current user |
| GET  | `/api/progress` | cookie | Fetch saved state blob |
| PUT  | `/api/progress` | cookie | Upsert state `{state, summary}` (256 KB cap) |
| GET  | `/api/leaderboard` | – | Top 50 by XP |

All mutating requests require the `X-CSRF-Token` header matching the `ca_csrf` cookie.

## Environment
See `.env.example`. In `NODE_ENV=production` the server **exits on boot** if
`JWT_SECRET` is missing or shorter than 32 chars — never run auth on a weak secret.

## Notes
- Rate limiting uses an in-memory store (single-instance). Use `rate-limit-redis`
  for multi-instance deployments and keep it failing closed.
- `better-sqlite3` is a native module; the Dockerfile installs build tools then prunes them.

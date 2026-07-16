// Central configuration — all secrets come from the environment, never hardcoded.
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';

// Minimal, dependency-free .env loader (works on all Node versions).
// Loads KEY=VALUE lines from ./.env WITHOUT overriding variables already set in
// the real environment (real env wins), so no secret is ever hardcoded.
(function loadDotEnv() {
  try {
    const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8');
    for (const line of raw.split('\n')) {
      const s = line.trim();
      if (!s || s.startsWith('#')) continue;
      const eq = s.indexOf('=');
      if (eq === -1) continue;
      const key = s.slice(0, eq).trim();
      let val = s.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key && process.env[key] === undefined) process.env[key] = val;
    }
  } catch { /* no .env file — that's fine */ }
})();

const isProd = process.env.NODE_ENV === 'production';

// JWT secret: required and strong in production; a random ephemeral one in dev
// (dev sessions won't survive a restart, which is fine for local use).
let jwtSecret = process.env.JWT_SECRET;
if (isProd) {
  if (!jwtSecret || jwtSecret.length < 32) {
    // Fail closed: never run production auth on a weak/absent secret.
    console.error('FATAL: JWT_SECRET must be set to a strong value (>=32 chars) in production.');
    process.exit(1);
  }
} else if (!jwtSecret) {
  jwtSecret = crypto.randomBytes(48).toString('hex');
  console.warn('[dev] JWT_SECRET not set — using a random ephemeral secret for this run.');
}

export const config = {
  isProd,
  port: Number(process.env.PORT || 8080),
  jwtSecret,
  dbPath: process.env.DB_PATH || './data/cloud-ascent.db',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',').map(s => s.trim()).filter(Boolean),
  serveFrontend: process.env.SERVE_FRONTEND === '1',
  cookieName: 'ca_session',
  csrfCookie: 'ca_csrf',
  sessionMaxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
};

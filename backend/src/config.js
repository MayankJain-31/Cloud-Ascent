// Central configuration — all secrets come from the environment, never hardcoded.
import crypto from 'node:crypto';

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

// Security middleware: headers, rate limiting, CSRF (double-submit), auth guard.
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

// --- Security headers (CSP, HSTS, nosniff, frame deny, referrer policy) ---
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // app uses inline styles
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

// --- Rate limiters ---
// NOTE: default store is in-memory (fine for a single instance / OSS starter).
// For multi-instance production, back this with Redis (rate-limit-redis) and
// keep failing CLOSED on backend errors.
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests, slow down.' },
});
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many attempts. Try again later.' },
});

// --- CSRF: double-submit cookie ---
// A non-HttpOnly token cookie is set; state-changing requests must echo it in
// the X-CSRF-Token header. An attacker's cross-site request can't read the
// cookie to forge the header (CWE-352).
export function csrfIssue(req, res, next) {
  let token = req.cookies?.[config.csrfCookie];
  if (!token) {
    token = crypto.randomBytes(24).toString('hex');
    res.cookie(config.csrfCookie, token, {
      sameSite: 'lax', secure: config.isProd, path: '/', maxAge: config.sessionMaxAgeMs,
    });
  }
  res.locals.csrf = token;
  next();
}
export function csrfProtect(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const cookieTok = req.cookies?.[config.csrfCookie];
  const headerTok = req.get('X-CSRF-Token');
  if (!cookieTok || !headerTok) return res.status(403).json({ error: 'Missing CSRF token' });
  const a = Buffer.from(cookieTok), b = Buffer.from(headerTok);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
}

// --- Session helpers ---
export function issueSession(res, userId) {
  const token = jwt.sign({ uid: userId }, config.jwtSecret, { expiresIn: '7d' });
  res.cookie(config.cookieName, token, {
    httpOnly: true, secure: config.isProd, sameSite: 'lax',
    path: '/', maxAge: config.sessionMaxAgeMs,
  });
}
export function clearSession(res) {
  res.clearCookie(config.cookieName, { path: '/' });
}
export function authRequired(req, res, next) {
  const token = req.cookies?.[config.cookieName];
  if (!token) return res.status(401).json({ error: 'Not signed in' });
  try {
    req.uid = jwt.verify(token, config.jwtSecret).uid;
    next();
  } catch {
    clearSession(res);
    return res.status(401).json({ error: 'Session expired' });
  }
}

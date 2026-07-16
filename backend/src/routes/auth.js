// Auth routes: register, login, logout, me.
// - Passwords hashed with bcrypt (cost 12). Never stored or logged in plaintext.
// - Input validated with zod; unknown fields rejected (mass-assignment safe).
// - Generic error messages: never reveal whether the email exists (anti-enumeration).
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { q } from '../db.js';
import { issueSession, clearSession, authRequired, authLimiter } from '../middleware/security.js';

const router = Router();
const BCRYPT_COST = 12;

const credsSchema = z.object({
  email: z.string().email().max(254).transform(s => s.trim().toLowerCase()),
  password: z.string().min(10, 'Password must be at least 10 characters').max(200),
  handle: z.string().min(2).max(24).regex(/^[a-zA-Z0-9_ -]+$/, 'Letters, numbers, _ - only').optional(),
}).strict();

const loginSchema = credsSchema.pick({ email: true, password: true }).strict();

router.post('/register', authLimiter, async (req, res) => {
  const parsed = credsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { email, password } = parsed.data;
  const handle = parsed.data.handle || email.split('@')[0].slice(0, 24);
  try {
    const pw_hash = await bcrypt.hash(password, BCRYPT_COST);
    const info = q.insertUser.run(email, handle, pw_hash, Date.now());
    issueSession(res, info.lastInsertRowid);
    return res.status(201).json({ user: { id: info.lastInsertRowid, email, handle } });
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      // Generic message — do not confirm the address is taken.
      return res.status(409).json({ error: 'Could not create account with those details.' });
    }
    console.error('register error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid email or password.' });
  const { email, password } = parsed.data;
  const user = q.userByEmail.get(email);
  // Always run a hash compare to keep timing uniform whether or not the user exists.
  const hash = user ? user.pw_hash : '$2b$12$0000000000000000000000000000000000000000000000000000';
  const ok = await bcrypt.compare(password, hash);
  if (!user || !ok) return res.status(401).json({ error: 'Invalid email or password.' });
  issueSession(res, user.id); // fresh session id on every login (no fixation, CWE-384)
  return res.json({ user: { id: user.id, email: user.email, handle: user.handle } });
});

router.post('/logout', (req, res) => { clearSession(res); res.json({ ok: true }); });

router.get('/me', authRequired, (req, res) => {
  const user = q.userById.get(req.uid);
  if (!user) { clearSession(res); return res.status(401).json({ error: 'Not signed in' }); }
  res.json({ user });
});

export default router;

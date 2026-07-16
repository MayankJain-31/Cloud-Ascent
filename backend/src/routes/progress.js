// Progress sync + leaderboard.
// The client state is stored as an opaque JSON blob (size-capped). A few numeric
// summary fields are validated and extracted for the leaderboard so we never run
// analytics over untrusted free-form data.
import { Router } from 'express';
import { z } from 'zod';
import { q } from '../db.js';
import { authRequired } from '../middleware/security.js';

const router = Router();
const MAX_BLOB = 256 * 1024; // 256 KB cap — prevents storage abuse (CWE-770)
const int0 = z.number().int().min(0).max(10_000_000).catch(0);

const syncSchema = z.object({
  state: z.record(z.any()),                 // opaque; re-serialized server-side
  summary: z.object({
    xp: int0, readiness: int0, accuracy: int0, answered: int0,
  }).partial().default({}),
}).strict();

router.get('/progress', authRequired, (req, res) => {
  const row = q.getProgress.get(req.uid);
  if (!row) return res.json({ state: null, updated_at: 0 });
  let state = null;
  try { state = JSON.parse(row.blob); } catch { state = null; }
  res.json({ state, updated_at: row.updated_at });
});

router.put('/progress', authRequired, (req, res) => {
  const parsed = syncSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid progress payload' });
  const blob = JSON.stringify(parsed.data.state);
  if (blob.length > MAX_BLOB) return res.status(413).json({ error: 'Progress too large' });
  const s = parsed.data.summary;
  const now = Date.now();
  q.upsertProgress.run({
    user_id: req.uid, blob,
    xp: s.xp ?? 0, readiness: Math.min(100, s.readiness ?? 0),
    accuracy: Math.min(100, s.accuracy ?? 0), answered: s.answered ?? 0,
    updated_at: now,
  });
  res.json({ ok: true, updated_at: now });
});

router.get('/leaderboard', (req, res) => {
  res.json({ entries: q.leaderboard.all() });
});

export default router;

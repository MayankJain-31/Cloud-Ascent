// SQLite data layer. Every query uses prepared statements with bound parameters
// (CWE-89 safe) — no string concatenation of user input into SQL, ever.
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from './config.js';

mkdirSync(dirname(config.dbPath), { recursive: true });

export const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT UNIQUE NOT NULL,
    handle      TEXT NOT NULL,
    pw_hash     TEXT NOT NULL,
    created_at  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS progress (
    user_id     INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    blob        TEXT NOT NULL,            -- opaque client state (JSON string)
    xp          INTEGER NOT NULL DEFAULT 0,
    readiness   INTEGER NOT NULL DEFAULT 0,
    accuracy    INTEGER NOT NULL DEFAULT 0,
    answered    INTEGER NOT NULL DEFAULT 0,
    updated_at  INTEGER NOT NULL
  );
`);

export const q = {
  insertUser: db.prepare(
    'INSERT INTO users (email, handle, pw_hash, created_at) VALUES (?, ?, ?, ?)'
  ),
  userByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  userById: db.prepare('SELECT id, email, handle, created_at FROM users WHERE id = ?'),
  upsertProgress: db.prepare(`
    INSERT INTO progress (user_id, blob, xp, readiness, accuracy, answered, updated_at)
    VALUES (@user_id, @blob, @xp, @readiness, @accuracy, @answered, @updated_at)
    ON CONFLICT(user_id) DO UPDATE SET
      blob=@blob, xp=@xp, readiness=@readiness, accuracy=@accuracy,
      answered=@answered, updated_at=@updated_at
  `),
  getProgress: db.prepare('SELECT blob, updated_at FROM progress WHERE user_id = ?'),
  leaderboard: db.prepare(`
    SELECT u.handle AS handle, p.xp AS xp, p.readiness AS readiness,
           p.accuracy AS accuracy, p.answered AS answered
    FROM progress p JOIN users u ON u.id = p.user_id
    WHERE p.answered > 0
    ORDER BY p.xp DESC, p.readiness DESC
    LIMIT 50
  `),
};

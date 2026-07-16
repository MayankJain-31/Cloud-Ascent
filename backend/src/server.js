// Cloud Ascent API server.
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from './config.js';
import {
  securityHeaders, generalLimiter, csrfIssue, csrfProtect,
} from './middleware/security.js';
import authRoutes from './routes/auth.js';
import progressRoutes from './routes/progress.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1); // correct client IPs behind a proxy (for rate limiting)

app.use(securityHeaders);
app.use(cors({
  origin(origin, cb) {
    // same-origin / curl (no Origin header) allowed; otherwise must be allow-listed
    if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Origin not allowed'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
}));
app.use(express.json({ limit: '300kb' }));
app.use(cookieParser());
app.use(csrfIssue);

// Health check + CSRF token bootstrap for the frontend
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));
app.get('/api/csrf', (req, res) => res.json({ csrfToken: res.locals.csrf }));

// All mutating API routes require a valid CSRF token + rate limiting
app.use('/api', generalLimiter, csrfProtect);
app.use('/api/auth', authRoutes);
app.use('/api', progressRoutes);

// Optionally serve the static frontend from the same service (single deploy)
if (config.serveFrontend) {
  const front = join(__dirname, '..', '..', 'frontend');
  app.use(express.static(front, { extensions: ['html'] }));
  app.get('*', (req, res) => res.sendFile(join(front, 'index.html')));
}

// Generic error handler — never leak stack traces to clients (CWE-209)
app.use((err, req, res, next) => {
  console.error('unhandled:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Cloud Ascent API on :${config.port} (${config.isProd ? 'production' : 'development'})`);
});

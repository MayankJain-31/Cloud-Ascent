// Ad-hoc end-to-end API check against a running server on PORT (default 8091).
// Run: node smoketest.mjs   (server must be running). Not part of the app.
const B = `http://localhost:${process.env.PORT || 8091}`;
let cookies = {};
function cookieHeader() { return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; '); }
function absorb(res) {
  const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  for (const c of sc) { const [kv] = c.split(';'); const i = kv.indexOf('='); cookies[kv.slice(0, i)] = kv.slice(i + 1); }
}
async function call(method, path, body, csrf) {
  const headers = { 'Content-Type': 'application/json', Cookie: cookieHeader() };
  if (csrf) headers['X-CSRF-Token'] = csrf;
  const res = await fetch(B + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  absorb(res);
  let data; try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}
const ok = (c) => c ? '✅' : '❌';
let pass = 0, total = 0;
function check(label, cond, detail) { total++; if (cond) pass++; console.log(`${ok(cond)} ${label}${detail ? '  → ' + detail : ''}`); }

const health = await call('GET', '/api/health');
check('health 200', health.status === 200);
const csrf = (await call('GET', '/api/csrf')).data.csrfToken;
check('csrf token issued', !!csrf && csrf.length >= 20);
const reg = await call('POST', '/api/auth/register', { email: 'climber@example.com', password: 'strongpass123', handle: 'climber' }, csrf);
check('register 201', reg.status === 201, JSON.stringify(reg.data));
const put = await call('PUT', '/api/progress', { state: { xp: 420, answered: 30 }, summary: { xp: 420, readiness: 55, accuracy: 80, answered: 30 } }, csrf);
check('progress saved', put.status === 200);
const get = await call('GET', '/api/progress');
check('progress restored (xp 420)', get.data?.state?.xp === 420, JSON.stringify(get.data?.state));
const lb = await call('GET', '/api/leaderboard');
check('leaderboard has climber', Array.isArray(lb.data.entries) && lb.data.entries.some(e => e.handle === 'climber' && e.xp === 420));
const noCsrf = await call('PUT', '/api/progress', { state: {} }, null);
check('CSRF rejected without token (403)', noCsrf.status === 403);
const badLogin = await call('POST', '/api/auth/login', { email: 'climber@example.com', password: 'wrongpassword' }, csrf);
check('bad password rejected (401) + generic msg', badLogin.status === 401 && /invalid email or password/i.test(badLogin.data.error || ''));
const weak = await call('POST', '/api/auth/register', { email: 'x@y.com', password: 'short' }, csrf);
check('weak password rejected (400)', weak.status === 400);
const dupe = await call('POST', '/api/auth/register', { email: 'climber@example.com', password: 'strongpass123' }, csrf);
check('duplicate email generic (409, no enumeration)', dupe.status === 409 && !/taken|exists/i.test(dupe.data.error || ''));

console.log(`\n${pass}/${total} checks passed`);
process.exit(pass === total ? 0 : 1);

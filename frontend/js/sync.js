/* Cloud Ascent — optional cloud sync + leaderboard layer.
   Talks to the backend API when one is reachable; otherwise stays dormant so the
   offline app is unaffected. Requires window.ACE bridge (exposed by index.html). */
(function () {
  'use strict';
  const CFG = window.CA_CONFIG || { apiBase: '' };
  const BASE = (CFG.apiBase || '').replace(/\/$/, '');
  const api = (p) => `${BASE}/api${p}`;
  let csrf = null, me = null, online = false, pushTimer = null;

  function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  async function jget(p) {
    const r = await fetch(api(p), { credentials: 'include' });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
    return r.json();
  }
  async function jsend(method, p, body) {
    if (!csrf) { try { csrf = (await jget('/csrf')).csrfToken; } catch { /* ignore */ } }
    const r = await fetch(api(p), {
      method, credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || r.statusText);
    return data;
  }

  // ---- state bridge helpers ----
  function localMeta() { try { return window.ACE.meta(); } catch { return { updatedAt: 0 }; } }
  function localState() { try { return window.ACE.get(); } catch { return null; } }

  async function pull() {
    const { state, updated_at } = await jget('/progress');
    if (state && updated_at > (localMeta().updatedAt || 0)) {
      window.ACE.load(state);
      toast('Progress restored from your account ☁︎');
    } else {
      await pushNow(); // local is newer (or server empty) → upload
    }
  }
  async function pushNow() {
    if (!me) return;
    const state = localState(); if (!state) return;
    const m = localMeta();
    try { await jsend('PUT', '/progress', { state, summary: { xp: m.xp | 0, readiness: m.readiness | 0, accuracy: m.accuracy | 0, answered: m.answered | 0 } }); }
    catch (e) { /* non-fatal; will retry on next save */ }
  }
  // debounced push, wired to the app's save()
  window.__onSave = function () { if (!me) return; clearTimeout(pushTimer); pushTimer = setTimeout(pushNow, 1500); };

  function toast(msg) { const t = document.getElementById('toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2400); }

  // ---- HUD button + modal ----
  let btn;
  function mountButton() {
    const hud = document.getElementById('hud'); if (!hud) return;
    btn = h('button', 'icobtn'); btn.style.marginLeft = '2px'; btn.title = 'Account & cloud sync';
    btn.textContent = '☁︎';
    btn.onclick = openModal;
    const theme = document.getElementById('themeBtn');
    hud.insertBefore(btn, theme);
    refreshBtn();
  }
  function refreshBtn() {
    if (!btn) return;
    btn.textContent = me ? '☁︎ ' + me.handle.slice(0, 8) : (online ? '☁︎ Sign in' : '☁︎');
    btn.style.color = me ? 'var(--green)' : '';
  }

  function overlay() {
    const o = h('div'); o.style.cssText = 'position:fixed;inset:0;z-index:100;background:rgba(10,15,25,.55);display:grid;place-items:center;padding:16px;backdrop-filter:blur(3px)';
    o.onclick = (e) => { if (e.target === o) o.remove(); };
    return o;
  }
  function card() {
    const c = h('div', 'card'); c.style.cssText = 'width:100%;max-width:420px;padding:22px'; c.onclick = e => e.stopPropagation(); return c;
  }

  function openModal() {
    const o = overlay(); const c = card(); o.appendChild(c); document.body.appendChild(o);
    if (!online) { c.innerHTML = disabledHTML(); wireDisabled(c, o); return; }
    if (me) renderAccount(c, o); else renderAuth(c, o, 'login');
  }
  function disabledHTML() {
    return '<h3 style="margin:0 0 8px">Cloud sync not configured</h3>'
      + '<p style="font-size:13px;color:var(--ink2);margin:0 0 12px">This build isn\'t connected to a backend, so your progress is saved on this device only. To enable accounts, sync and the global leaderboard, run the backend and point this frontend at it.</p>'
      + '<div style="font-size:12px;color:var(--ink3);margin-bottom:10px">Set the API origin (stored locally):</div>'
      + '<input id="ca_base" placeholder="https://your-api.example.com" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);margin-bottom:10px">'
      + '<div style="display:flex;gap:8px"><button class="btn" id="ca_save">Save & reload</button><button class="btn ghost" id="ca_close">Close</button></div>';
  }
  function wireDisabled(c, o) {
    c.querySelector('#ca_base').value = BASE;
    c.querySelector('#ca_save').onclick = () => { const v = c.querySelector('#ca_base').value.trim(); localStorage.setItem('ca.apiBase', v); location.reload(); };
    c.querySelector('#ca_close').onclick = () => o.remove();
  }

  function renderAuth(c, o, tab) {
    c.innerHTML =
      '<div style="display:flex;gap:6px;margin-bottom:16px">'
      + tabBtn('login', tab) + tabBtn('register', tab) + '</div>'
      + '<div id="ca_err" style="display:none;background:var(--redbg);color:var(--red);border-radius:10px;padding:8px 12px;font-size:12.5px;margin-bottom:12px"></div>'
      + (tab === 'register' ? field('handle', 'Display name', 'text', 'ace_climber') : '')
      + field('email', 'Email', 'email', 'you@example.com')
      + field('password', 'Password (min 10 chars)', 'password', '••••••••••')
      + '<button class="btn" id="ca_go" style="width:100%;margin-top:6px">' + (tab === 'register' ? 'Create account' : 'Sign in') + '</button>';
    c.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => renderAuth(c, o, b.dataset.tab));
    c.querySelector('#ca_go').onclick = async () => {
      const err = c.querySelector('#ca_err'); err.style.display = 'none';
      const email = c.querySelector('#f_email').value.trim();
      const password = c.querySelector('#f_password').value;
      const handle = tab === 'register' ? c.querySelector('#f_handle').value.trim() : undefined;
      try {
        const body = tab === 'register' ? { email, password, handle } : { email, password };
        const res = await jsend('POST', '/auth/' + tab, body);
        me = res.user; refreshBtn();
        await pull();
        renderAccount(c, o);
      } catch (e) { err.textContent = e.message; err.style.display = 'block'; }
    };
  }
  const tabBtn = (id, active) => `<button data-tab="${id}" class="btn ${id === active ? '' : 'ghost'} sm" style="flex:1">${id === 'login' ? 'Sign in' : 'Register'}</button>`;
  const field = (id, label, type, ph) => `<label style="display:block;font-size:12px;font-weight:700;color:var(--ink2);margin:0 0 4px">${label}</label>`
    + `<input id="f_${id}" type="${type}" placeholder="${ph}" style="width:100%;padding:11px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);margin-bottom:12px" ${type === 'password' ? 'autocomplete="current-password"' : ''}>`;

  async function renderAccount(c, o) {
    c.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
      + '<div><div style="font-size:11px;color:var(--ink3);text-transform:uppercase;letter-spacing:.6px">Signed in as</div>'
      + '<div style="font-size:18px;font-weight:800">' + esc(me.handle) + '</div></div>'
      + '<span class="pill p-green">☁︎ syncing</span></div>'
      + '<div style="display:flex;gap:8px;margin-bottom:16px"><button class="btn sm" id="ca_sync">Sync now</button>'
      + '<button class="btn ghost sm" id="ca_out">Sign out</button></div>'
      + '<h4 style="font-size:14px;margin:0 0 8px">🏆 Global leaderboard</h4>'
      + '<div id="ca_lb" style="font-size:13px">Loading…</div>';
    c.querySelector('#ca_sync').onclick = async () => { await pushNow(); toast('Progress synced ☁︎'); };
    c.querySelector('#ca_out').onclick = async () => { try { await jsend('POST', '/auth/logout'); } catch {} me = null; refreshBtn(); o.remove(); toast('Signed out'); };
    try {
      const { entries } = await jget('/leaderboard');
      const lb = c.querySelector('#ca_lb');
      if (!entries.length) { lb.innerHTML = '<div style="color:var(--ink3)">No entries yet — be the first!</div>'; return; }
      lb.innerHTML = entries.slice(0, 10).map((e, i) =>
        `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line)">
           <span><b style="color:var(--ink3);margin-right:8px">${i + 1}</b>${esc(e.handle)}${e.handle === me.handle ? ' <span style="color:var(--green)">(you)</span>' : ''}</span>
           <span style="font-variant-numeric:tabular-nums">${e.xp} XP · ${e.readiness}%</span>
         </div>`).join('');
    } catch { c.querySelector('#ca_lb').textContent = 'Could not load leaderboard.'; }
  }

  // ---- boot ----
  async function init() {
    try { await jget('/health'); online = true; } catch { online = false; }
    if (online) { try { me = (await jget('/auth/me')).user; } catch { me = null; } }
    mountButton();
    if (me) { try { await pull(); } catch {} }
  }
  if (window.ACE) init();
  else window.addEventListener('ace:ready', init, { once: true });
})();

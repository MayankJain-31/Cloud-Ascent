// Cloud Ascent frontend configuration.
// The app works 100% offline (localStorage). Cloud sync + leaderboard are OPTIONAL
// and only light up when a reachable backend is configured here.
//
// - Deploying frontend + backend together (SERVE_FRONTEND=1)? Leave apiBase as ''.
//   It will use the same origin ('/api').
// - Frontend on GitHub Pages, backend elsewhere? Set apiBase to your API origin,
//   e.g. 'https://cloud-ascent-api.onrender.com'
window.CA_CONFIG = {
  // Empty string => same origin. Otherwise a full origin (no trailing slash).
  apiBase: localStorage.getItem('ca.apiBase') || '',
};

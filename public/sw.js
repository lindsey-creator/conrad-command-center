/*
 * JARVIS Command Center — app-shell service worker.
 *
 * The Brain (FastAPI) and this deck share one Railway origin, so this worker
 * is deliberately narrow: it only ever touches the navigation document and
 * build assets. Every other request — /health, /chat, /connectors/status,
 * /clickup/*, /approvals/*, /connect/* and the rest of the API surface — is
 * passed straight through to the network untouched, so no API response is
 * ever cached, replayed or rewritten.
 */

const CACHE = 'jarvis-shell-v1';

/** Only these paths may be served from cache. Everything else is network. */
function isShellAsset(url) {
  return (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname === '/manifest.webmanifest'
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['./', './manifest.webmanifest']))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Navigation: network first so a fresh Railway deploy lands immediately,
  // cache fallback so the deck still opens with no signal.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./', copy)).catch(() => undefined);
          return res;
        })
        .catch(() => caches.match('./').then((hit) => hit || Response.error())),
    );
    return;
  }

  // Build assets are content-hashed and immutable: cache first.
  if (isShellAsset(url)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => undefined);
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Anything else (the entire Brain API) — no respondWith, straight to network.
});

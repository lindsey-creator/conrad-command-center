/* JARVIS HUD service worker — installable shell only.
   Never cache Brain routes. Network-first so HUD_BUILD deploys win. */
const SHELL = 'jarvis-hud-shell-2026-09-14-phase1-reskin';
const PRECACHE = [
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-180.png',
];

function isBrainPath(url) {
  const path = new URL(url).pathname;
  return (
    path === '/health' ||
    path === '/chat' ||
    path.startsWith('/connect') ||
    path.startsWith('/api') ||
    path.startsWith('/whoop') ||
    path.startsWith('/calendar') ||
    path.startsWith('/jobs')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (isBrainPath(req.url)) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && new URL(req.url).pathname.startsWith('/icons/')) {
          const copy = res.clone();
          caches.open(SHELL).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req)),
  );
});

const CACHE = 'paceboard-offline-v1';
const CORE = [
  './', './index.html', './styles.css', './screens.css', './minimal-scene.css', './sprint.css', './app.js', './manifest.json',
  './assets/icon-180.png', './assets/icon-512.png'
];
for (const folder of ['user-run', 'user-fast']) for (let i = 0; i < 8; i++) CORE.push(`./assets/${folder}/frame-${i}.png`);
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (event.request.method === 'GET' && response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  })));
});

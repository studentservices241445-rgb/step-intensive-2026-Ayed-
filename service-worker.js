const CACHE_NAME = 'ayed-static-v1';
const ASSETS = [
  './',
  'index.html',
  'course-content.html',
  'level-test.html',
  'testimonials.html',
  'faq.html',
  'register.html',
  'support.html',
  'privacy.html',
  'refund.html',
  'terms.html',
  'styles.css',
  'app.js',
  'test.js',
  'site-data.js',
  'questions.json',
  'manifest.json',
  'assets/icon-192.svg',
  'assets/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        if (new URL(event.request.url).origin === location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
    })
  );
});

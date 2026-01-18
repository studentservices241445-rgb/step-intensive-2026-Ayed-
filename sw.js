const CACHE_NAME = 'ayed-cache-v2';
const ASSETS = [
  './',
  'index.html',
  'course-content.html',
  'faq.html',
  'level-test.html',
  'privacy.html',
  'register.html',
  'refund.html',
  'testimonials.html',
  'app.js',
  'site-data.js',
  'test.js',
  'register.js',
  'styles.css',
  'logo.png',
  'questions.json',
  'manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

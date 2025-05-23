const CACHE_NAME = 'ops-solutions-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/global.css',
  '/css/small-screens.css',
  '/js/main.js',
  '/js/service-worker.js',
  '/assets/logo.png',
  '/assets/hero-image.jpg',
  '/assets/favicon.ico',
  '/assets/images/hero-image.jpg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    }).catch(() => {
      // Optional fallback for offline page can be added here
    })
  );
});

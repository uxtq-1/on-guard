// Placeholder service-worker.js
// This service worker is intentionally kept simple for now.
// It can be expanded later for caching strategies, push notifications, etc.

const CACHE_NAME = 'ops-online-support-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/base/global.css',
  '/css/base/small-screens.css',
  '/js/pages/main.js'
  // Add other important assets that should be cached for offline use
];

self.addEventListener('install', event => {
  console.log('ServiceWorker: Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('ServiceWorker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('ServiceWorker: Failed to cache app shell:', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('ServiceWorker: Activate event');
  // Remove old caches if any
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  console.log('ServiceWorker: Fetch event for', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('ServiceWorker: Found in cache', event.request.url);
          return response;
        }
        console.log('ServiceWorker: Network request for', event.request.url);
        return fetch(event.request).then(response => {
          // Optional: Cache new requests dynamically
          // if (!response || response.status !== 200 || response.type !== 'basic') {
          //   return response;
          // }
          // const responseToCache = response.clone();
          // caches.open(CACHE_NAME).then(cache => {
          //   cache.put(event.request, responseToCache);
          // });
          return response;
        });
      })
      .catch(error => {
        console.error('ServiceWorker: Fetch error:', error);
        // Optional: Respond with a fallback page for offline if request fails
        // return caches.match('/offline.html');
      })
  );
});

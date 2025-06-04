const CACHE_NAME = 'ops-solutions-cache-v2'; // Updated cache name
const urlsToCache = [
  '/',
  '/index.html',
  '/about-us.html',
  '/contact.html',
  '/join.html',
  '/security.html',
  '/business-operations.html',
  '/contact-center.html',
  '/it-support.html',
  '/professionals.html',
  '/css/global.css',
  '/css/small-screens.css',
  // css/contact.css is not included as its existence is not confirmed
  '/js/main.js',
  '/js/form-encryptor.js',
  '/js/contact-handler.js',
  '/js/join-handler.js',
  '/js/service-worker.js', // Caching itself
  '/assets/logo.png',
  '/assets/images/hero-image.jpg',
  '/assets/favicon.ico',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache ' + CACHE_NAME + ', caching urls:');
      console.log(urlsToCache);
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('Deleting old cache:', key);
          return caches.delete(key);
        }
      })
    ))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(response => {
        // Don't cache opaque responses (e.g. from CDNs without CORS) or non-OK responses
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
      // Optional: Fallback for offline, e.g., return a specific offline HTML page
      // if (event.request.mode === 'navigate') {
      //   return caches.match('/offline.html');
      // }
    })
  );
});

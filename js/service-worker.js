// Placeholder service-worker.js
// This service worker is intentionally kept simple for now.
// It can be expanded later for caching strategies, push notifications, etc.

const CACHE_NAME = 'ops-online-support-v2'; // Incremented cache version
const urlsToCache = [
  '/index.html', // Covers '/'
  '/offline.html',
  '/manifest.json',

  // Core CSS
  '/css/base/global.css',
  '/css/base/small-screens.css',
  '/css/base/iframe-chat-wrapper.css',

  // Modal CSS
  '/css/modals/contact_us_modal.css',
  '/css/modals/join_us_modal.css',
  '/css/modals/chatbot_modal.css',

  // Core JS
  '/js/utils/rootPath.js',
  '/js/utils/sanitize.js',
  '/js/pages/main.js',

  // Page-specific JS (modules)
  '/js/pages/contact_us.js',
  '/js/pages/join_us.js',
  '/js/pages/chatbot.js',
  // Note: chatbot.js itself might reference chatbot_creation/chatbot.js,
  // but that script is part of an iframe, so caching it here might not be
  // directly useful unless the iframe itself is made offline capable.
  // For now, focusing on assets directly requested by main pages.

  // Modal HTML
  '/html/modals/contact_us_modal.html',
  '/html/modals/join_us_modal.html',
  '/html/modals/chatbot_modal.html'
  // Add other important assets that should be cached for offline use
];

self.addEventListener('install', event => {
  // console.log('ServiceWorker: Install event - v2');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // console.log('ServiceWorker: Caching app shell - v2');
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' }))); // Ensure fresh copies
      })
      .catch(error => {
        console.error('ServiceWorker: Failed to cache app shell - v2:', error);
      })
  );
});

self.addEventListener('activate', event => {
  // console.log('ServiceWorker: Activate event - v2');
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
  // console.log('ServiceWorker: Fetch event for', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // console.log('ServiceWorker: Found in cache', event.request.url);
          return response;
        }
        // console.log('ServiceWorker: Network request for', event.request.url);
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
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
  );
});

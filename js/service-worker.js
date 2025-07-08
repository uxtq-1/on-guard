// service-worker.js — OPS Online Support
// Hardened cache control, offline fallback, and baseline for future upgrades (push, encryption, TinyML anomaly reports)

const CACHE_NAME = 'ops-online-support-v2';
const urlsToCache = [
  '/index.html',
  '/offline.html',
  '/manifest.json',

  // Core CSS
  '/css/base/global.css',
  '/css/base/small-screens.css',

  // Modal-specific CSS
  '/css/modals/contact_us_modal.css',
  '/css/modals/join_us_modal.css',
  '/mychatbot/chatbot-modal.css',

  // Core JS
  '/js/utils/rootPath.js',
  '/js/core/sanitize-input.js',
  '/js/pages/main.js',

  // Page logic
  '/js/pages/contact_us.js',
  '/js/pages/join_us.js',
  '/mychatbot/chatbot-modal.js',

  // Modal HTML Fragments
  '/html/modals/contact_us_modal.html',
  '/html/modals/join_us_modal.html',
  '/mychatbot/chatbot-modal.html'
];

// Install: Pre-cache critical shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(
          urlsToCache.map((url) => new Request(url, { cache: 'reload' }))
        );
      })
      .catch((error) => {
        console.error('[SW] Install error:', error);
      })
  );
});

// Activate: Remove old versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.filter((name) => name !== CACHE_NAME)
            .map((oldCache) => caches.delete(oldCache))
        )
      )
  );
  return self.clients.claim();
});

// Fetch: Serve from cache, fallback to network, fallback to offline page
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then((networkResponse) => {
            // Optionally cache dynamically fetched resources here
            return networkResponse;
          });
      })
      .catch((error) => {
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
  );
});

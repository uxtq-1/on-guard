// service-worker.js — OPS Online Support
// Hardened cache control, offline fallback, and baseline for future upgrades (push, encryption, TinyML anomaly reports)

const CACHE_NAME = 'ops-online-support-v2';
const urlsToCache = [
  '/index.html',
  '/offline.html',
  '/manifest.json',

  // Core CSS
  '/css/global/global.css',
  '/css/responsive/small-screens.css',
  '/chatbot-modal/chatbot-fixed-widget.css',

  // Modal-specific CSS
  '/contact-us-modal/contact-us-modal.css',
  '/join-us-modal/join-us-modal.css',
  '/chatbot-modal/chatbot-modal.css',

  // Core JS
  '/js/core/root-path-handler.js',
  '/js/core/sanitize-input.js',
  '/js/core/main.js',

  // Page logic
  '/contact-us-modal/contact-us-modal.js',
  '/join-us-modal/join-us-modal.js',
  '/chatbot-modal/chatbot-modal.js',

  // Modal HTML Fragments
  '/contact-us-modal/contact-us-modal.html',
  '/join-us-modal/join-us-modal.html',
  '/chatbot-modal/chatbot-modal.html'
  // It would be good to also cache:
  // - /pages/*.html
  // - /services-modal/*/*.html
  // - /services-modal/*.html
  // - /ui-components/*/*.html
  // - /js/language_toggle/language-toggle.js
  // - /js/core/modal-handler.js
  // - CSS files from services-modal/*/*.css
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

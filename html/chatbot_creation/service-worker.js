const CACHE_NAME = 'ops-chatbot-widget-cache-v1';
const urlsToCache = [
  './chatbot-widget.html', // The main widget HTML
  // Add other specific assets if they were externalized, e.g., CSS, specific JS for the widget
  // For FontAwesome, it's a CDN link, so it's subject to its own caching.
  // The reCAPTCHA script is also external from Google.
];

// Install event: opens the cache and adds the core files to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activate worker immediately
  );
});

// Activate event: cleans up old caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of open clients
  );
});

// Fetch event: serves assets from cache first, falling back to network.
// For a chatbot that needs network for API calls, this is a cache-first for app shell.
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // For navigation requests (e.g., accessing the HTML page itself)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request).catch(() => {
            // Optional: return a custom offline page if chatbot-widget.html itself can't be fetched
            // return caches.match('./offline.html');
            // For now, just let the browser handle the offline error for the page itself if not cached.
          });
        })
    );
    return;
  }

  // For other requests (assets, API calls, etc.)
  // We generally don't want to cache API calls for the chatbot (POST requests to worker)
  // or external scripts like reCAPTCHA, FontAwesome if they are frequently updated or handle their own caching.
  // This example primarily focuses on caching the app shell (widget HTML).
  // If there were local assets like CSS/JS specific to this widget, they'd be in urlsToCache
  // and would be served cache-first by a similar caches.match strategy.

  // Default: go to network for non-cached assets / non-navigation requests
  // event.respondWith(fetch(event.request));
});

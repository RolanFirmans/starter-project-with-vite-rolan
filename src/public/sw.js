const CACHE_NAME = 'app-shell-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css', 
  '/index.js',   
  '/favicon.png',
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      );
    })
  );
});


// Activate event (optional cleanup old caches)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
    ))
  );
});

// Fetch event - cache first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResp => cachedResp || fetch(event.request))
  );
});

event.respondWith(
  caches.match(event.request)
    .then(cachedResp => cachedResp || fetch(event.request))
    .catch(err => {
      console.error('Fetch failed:', err);
      return new Response('Offline or not found', { status: 404 });
    })
);

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResp => cachedResp || fetch(event.request))
      .catch(err => {
        console.error('Fetch failed for:', event.request.url, err);
        return new Response('Offline or not found', { status: 404 });
      })
  );
});

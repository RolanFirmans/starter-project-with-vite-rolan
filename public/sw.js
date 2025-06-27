const CACHE_VERSION = 'v2'; 
const CACHE_NAME_PREFIX = 'story-app-cache';
const CACHE_NAME = `${CACHE_NAME_PREFIX}-${CACHE_VERSION}`;


const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/marker-icon.png',
  '/marker-icon-2x.png',
  '/marker-shadow.png',
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Menginstall...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Pre-caching App Shell...', APP_SHELL_URLS);
      return cache.addAll(APP_SHELL_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Aktif.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith(CACHE_NAME_PREFIX) && cacheName !== CACHE_NAME)
          .map((cacheNameToDelete) => {
            console.log('Service Worker: Menghapus cache lama:', cacheNameToDelete);
            return caches.delete(cacheNameToDelete);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

 
  if (url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/v1/stories')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const cache = caches.open(CACHE_NAME);
          cache.then((c) => c.put(event.request, networkResponse.clone()));
          return networkResponse;
        })
        .catch(() => caches.match(event.request)) 
    );
    return;
  }

  
  if (
    (url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/images/stories/')) ||
    url.origin === 'https://fonts.gstatic.com' ||
    url.hostname.includes('tile.openstreetmap.org')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((networkResponse) => {
          const cache = caches.open(CACHE_NAME);
          cache.then((c) => c.put(event.request, networkResponse.clone()));
          return networkResponse;
        });
      })
    );
    return;
  }

  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Jika ada di cache, langsung gunakan.
      if (cachedResponse) {
        return cachedResponse;
      }
      // Jika tidak ada, ambil dari network, lalu simpan ke cache.
      return fetch(event.request).then((networkResponse) => {
        const cache = caches.open(CACHE_NAME);
        cache.then((c) => c.put(event.request, networkResponse.clone()));
        return networkResponse;
      });
    })
  );
});


self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received.');
  const notificationData = event.data.json();
  const { title, options } = notificationData;
  console.log(`Displaying notification: "${title}"`);
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked.");
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/';
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
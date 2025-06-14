const CACHE_NAME = 'app-shell-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json', 
  '/assets/index-CXsxona0.css',     
  '/assets/index-mPS6Xbai.js', 
  '/images/logo.png',
  '/images/walpaper1.jpg', 
  '/favicon.png',
  
];


self.addEventListener('install', event => {
  console.log('Service Worker: Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) 
  );
});


self.addEventListener('activate', event => {
  console.log('Service Worker: Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) 
  );
});


self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('Returning from cache:', event.request.url);
          return cachedResponse;
        }
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request).then(networkResponse => {
         
          return networkResponse;
        });
      }).catch(error => {
        console.error('Service Worker: Fetch failed; returning offline fallback.', error);
       
        return new Response('Anda sedang offline. Beberapa konten mungkin tidak tersedia.', {
          status: 404,
          statusText: 'Offline',
          headers: {'Content-Type': 'text/plain'}
        });
      })
  );
});


self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  const notificationData = event.data.json(); 
  const title = notificationData.title || 'Notifikasi Baru';
  const options = {
    body: notificationData.body || 'Ada sesuatu yang baru untukmu!',
    icon: '/images/logo.png', 
    badge: '/images/walpaper1.jpg', 

    data: {
      url: notificationData.url || '/', 
    },
  };

 
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
 
  event.notification.close();


  const urlToOpen = event.notification.data.url;
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
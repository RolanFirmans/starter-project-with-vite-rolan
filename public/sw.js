// public/sw.js - KODE FINAL
const CACHE_NAME = 'story-app-cache-v15'; // Versi dinaikkan untuk memicu update
// sw.js - CONTOH UNTUK DEVELOPMENT
const ASSETS_TO_CACHE = [
    '/', // Ini mewakili index.html di root
    '/index.html',
    '/manifest.json',
    '/favicon.png',
    '/assets/index-wALjkHrL.js',   
    '/assets/index-BKpaSXvd.css',  
    '/icons/icon-48x48.png',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-256x256.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    '/marker-icon-2x.png',
    '/marker-shadow.png',
    
  
];

// Listener 'install': Caching app shell
self.addEventListener('install', event => {
  console.log('Service Worker: Install v2');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Listener 'activate': Membersihkan cache lama
self.addEventListener('activate', event => {
  console.log('Service Worker: Activate v2');
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

// Listener 'fetch': (Tetap sama, sudah bagus)
// public/sw.js - PERBAIKAN UNTUK FETCH LISTENER

// Di dalam file sw.js

// ... (di dalam event listener 'fetch') ...

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategi untuk API call (sudah ada)
  if (url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/v1/stories')) {
    // ... logika Network-First Anda untuk data JSON ...
    return;
  }

  // === TAMBAHKAN BLOK 'ELSE IF' DI BAWAH INI ===
  // Strategi Cache-First untuk gambar cerita dari API
  else if (url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/images/stories/')) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse; // Jika ada di cache, langsung kembalikan
        }

        // Jika tidak ada, fetch dari network
        return fetch(request).then(networkResponse => {
          return caches.open('dynamic-images-cache').then(cache => { // Gunakan cache terpisah untuk gambar
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }
  // === AKHIR BAGIAN TAMBAHAN ===

  // Strategi untuk Aset Lokal (App Shell)
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      return cachedResponse || fetch(request);
    })
  );
});

  


// Listener 'push': Menangani notifikasi masuk (VERSI DENGAN DEBUGGING)
self.addEventListener('push', event => {
  console.log('Service Worker: Push Received.');
  console.log('--> Push event data mentah:', event.data);

  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.log('--> Gagal parse JSON, mencoba sebagai teks.');
    data = {
      title: 'Notifikasi Baru',
      body: event.data.text(),
      url: '/'
    };
  }

  const options = {
    body: data.body,
    icon: '/images/badge.png',
    data: {
      url: data.url || '/'
    }
  };

  console.log('--> Mencoba menampilkan notifikasi dengan judul:', data.title);
  console.log('--> Dan dengan options:', options);

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});


// Listener 'notificationclick': (Tetap sama, sudah bagus)
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked.');
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
// public/sw.js - KODE FINAL
const CACHE_NAME = "story-app-cache-v51"; // Versi dinaikkan untuk memicu update
// sw.js - CONTOH UNTUK DEVELOPMENT
const ASSETS_TO_CACHE = [
  "/", // Ini mewakili index.html di root
  "/index.html",
  "/manifest.json",
  "/favicon.png",
  "/assets/index-CBOXk12m.js",
  "/assets/index-BKpaSXvd.css",
  "/icons/icon-48x48.png",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-256x256.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
  "/marker-icon-2x.png",
  "/marker-shadow.png",
  "/marker-icon.png", 
];

// Listener 'install': Caching app shell
self.addEventListener("install", (event) => {
  console.log("Service Worker: Install v2");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching App Shell");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Listener 'activate': Membersihkan cache lama
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activate v2");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Clearing old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Listener 'fetch': (Tetap sama, sudah bagus)
// public/sw.js - PERBAIKAN UNTUK FETCH LISTENER

// Di dalam file sw.js

// ... (di dalam event listener 'fetch') ...

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Caching untuk Google Fonts (runtime caching)
  if (
    event.request.url.startsWith("https://fonts.googleapis.com/") ||
    event.request.url.startsWith("https://fonts.gstatic.com/")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        // Gunakan CACHE_NAME yang sama atau cache terpisah
        return fetch(event.request)
          .then((response) => {
            return cache
              .put(event.request, response.clone())
              .then(() => response);
          })
          .catch(() => {
            // Jika fetch gagal dan tidak ada di cache, mungkin ada fallback khusus
            return caches.match(event.request); // Coba ambil dari cache jika gagal
          });
      })
    );
    return; // Penting: hentikan pemrosesan lebih lanjut
  }

  if (
    event.request.url.startsWith("https://{s}.tile.openstreetmap.org/") ||
    event.request.url.includes("tile.openstreetmap.org")
  ) {
    // Lebih fleksibel
    event.respondWith(
      caches.open("map-tiles-cache").then((cache) => {
        // Gunakan cache terpisah untuk tiles
        return cache.match(event.request).then((response) => {
          return (
            response ||
            fetch(event.request)
              .then((networkResponse) => {
                // Hanya cache respons yang sukses
                if (networkResponse.ok) {
                  cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(() => {
                // Jika gagal, bisa fallback ke gambar offline placeholder untuk tiles
                // atau biarkan saja kosong jika tidak ada fallback
              })
          );
        });
      })
    );
    return; // Penting: hentikan pemrosesan lebih lanjut
  }

  // Strategi untuk API call (sudah ada)
  if (
    url.origin === "https://story-api.dicoding.dev" &&
    url.pathname.startsWith("/v1/stories")
  ) {
    // ... logika Network-First Anda untuk data JSON ...
    return;
  }

  // === TAMBAHKAN BLOK 'ELSE IF' DI BAWAH INI ===
  // Strategi Cache-First untuk gambar cerita dari API
  else if (
    url.origin === "https://story-api.dicoding.dev" &&
    url.pathname.startsWith("/images/stories/")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Jika ada di cache, langsung kembalikan
        }

        // Jika tidak ada, fetch dari network
        return fetch(request).then((networkResponse) => {
          return caches.open("dynamic-images-cache").then((cache) => {
            // Gunakan cache terpisah untuk gambar
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
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          // Opsional: cache resource yang didapat dari network (misal gambar)
          if (
            networkResponse.ok &&
            event.request.url.match(/\.(png|jpg|jpeg|gif|svg)$/)
          ) {
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback untuk aset yang tidak ditemukan di cache dan gagal dari network
          // Contoh untuk HTML: return caches.match('/offline.html');
          return new Response("Offline Content Unavailable", {
            status: 503,
            statusText: "Offline",
          });
        });
    })
  );
});

// Listener 'push': Menangani notifikasi masuk (VERSI DENGAN DEBUGGING)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received.');

  let notificationData;
  try {
    // PERBAIKAN: Langsung parse JSON sesuai schema yang disepakati
    notificationData = event.data.json();
  } catch (error) {
    console.error('Failed to parse push data as JSON:', error);
    notificationData = {
      title: 'Notifikasi Baru',
      options: {
        body: event.data.text() || 'Anda memiliki pesan baru.',
        icon: '/icons/icon-192x192.png',
        data: { url: '/' },
      },
    };
  }

  // Ambil title dan options langsung dari data yang sudah diparsing
  const { title, options } = notificationData;

  console.log(`Displaying notification: "${title}"`);
  event.waitUntil(self.registration.showNotification(title, options));
});

// Listener 'notificationclick': (Tetap sama, sudah bagus)
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked.");
  event.notification.close();
  const urlToOpen = event.notification.data.url;
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

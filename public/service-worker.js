
const CACHE_NAME = 'chefai-studio-v4';
const IMAGE_CACHE = 'chefai-images-v1';
const BASE_PATH = '/AIchef/';
const ASSETS_TO_CACHE = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Google+Sans:wght@400;500;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Skip AI and Firebase calls
  if (url.includes('googleapis.com') || url.includes('firebase')) {
    return;
  }

  // Strategy for images: Cache First
  if (event.request.destination === 'image' || url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then((fetchResponse) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Default Strategy: Stale-While-Revalidate for other assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((fetchResponse) => {
        // Cache external libs and our own assets
        if (url.includes('esm.sh') || url.includes('lucide-react') || url.includes(BASE_PATH)) {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      });
      return cachedResponse || fetchPromise;
    }).catch(() => {
      // Fallback for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match(`${BASE_PATH}index.html`);
      }
    })
  );
});

const CACHE_NAME = 'chefai-studio-v2';
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
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('googleapis.com') || event.request.url.includes('firebase')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        if (event.request.url.includes('esm.sh') || event.request.url.includes('lucide-react')) {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      });
    }).catch(() => {
      return caches.match(BASE_PATH) || caches.match(`${BASE_PATH}index.html`);
    })
  );
});
const CACHE_NAME = 'ats-maker-v2';
const urlsToCache = [
  '/manifest.json',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url).catch(err => console.log('Failed to cache:', url)))
        );
      })
  );
  self.skipWaiting();
});

// Fetch event - network first, skip caching during development
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip internal Next.js requests, HMR, and development endpoints
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/__next') ||
    url.pathname.includes('webpack-hmr') ||
    url.pathname.includes('_rsc') ||
    url.pathname.includes('turbopack') ||
    url.search.includes('_rsc') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Network first strategy for everything else
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses for static assets
        if (response.ok && url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
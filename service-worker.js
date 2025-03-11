const CACHE_NAME = 'financial-goals-tracker-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Instalacja Service Workera
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Otwarto pamięć podręczną');
        return cache.addAll(urlsToCache);
      })
  );
});

// Obsługa żądań
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Zwraca odpowiedź z pamięci podręcznej, jeśli jest dostępna
        if (response) {
          return response;
        }
        
        // Klonowanie żądania, ponieważ jest ono jednorazowe
        return fetch(event.request.clone())
          .then(response => {
            // Sprawdzenie, czy odpowiedź jest poprawna
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Klonowanie odpowiedzi, ponieważ jest ona jednorazowa
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Aktualizacja Service Workera
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Usunięcie starych pamięci podręcznych
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
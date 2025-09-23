// sw.js

// Nom du cache. Incrémenter ce numéro force la mise à jour du service worker.
// J'ai incrémenté la version pour forcer la mise à jour chez l'utilisateur.
const CACHE_NAME = 'retex-expert-cache-v5';

// Liste des ressources essentielles pour le fonctionnement hors ligne
const URLS_TO_CACHE = [
  '/',
  // BUG FIX: Correction du nom de fichier
  '/retexprax.html',
  'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0',
  'https://fonts.gstatic.com/s/oswald/v53/KF5_feature_all.woff2',
  'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/lib/wasm/web-llm.js',
  './web-llm-worker.js',
  // BUG FIX: Ajout de l'URL du script du worker qui est importé
  'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/lib/wasm/web-llm-worker.js'
];

// Installation : mise en cache des ressources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Mise en cache des ressources de l\'application.');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression de l\'ancien cache :', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch : stratégie "Network Falling Back to Cache"
// On essaie le réseau d'abord, si ça échoue, on prend dans le cache.
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, responseToCache));
                return networkResponse;
            })
            .catch(() => caches.match(event.request))
    );
});

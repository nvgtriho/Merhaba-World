const CACHE_NAME = "merhaba-world-v2";
const LOCAL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/src/App.js",
  "/src/styles.css",
  "/src/lib/markdownImporter.js",
  "/src/lib/maps.js",
  "/src/lib/offlineStore.js",
  "/src/lib/supabaseAdapter.js",
  "/src/lib/weather.js",
  "/src/data/tripSeed.js",
  "/src/data/turkishTemplate.js",
  "/assets/icon.svg",
  "/assets/icon-maskable.svg",
  "/assets/istanbul-hero.svg",
  "/assets/turkey-route.svg",
  "/assets/wiki/flight-tk2001.jpg",
  "/assets/wiki/flight-tk2320.jpg",
  "/assets/wiki/king-apart-goreme-confirmation.jpg",
  "/assets/wiki/saint-john-confirmation.jpg",
  "/assets/wiki/saint-john-place.jpg",
  "/assets/wiki/salonika-suites-confirmation.png",
  "/assets/wiki/salonika-suites-place.jpg",
  "/assets/wiki/ticket-kamilkoc-antalya-goreme.jpg"
];

const NETWORK_FIRST_PATHS = new Set([
  "/",
  "/index.html",
  "/src/App.js",
  "/src/styles.css",
  "/src/data/tripSeed.js",
  "/src/lib/maps.js"
]);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(LOCAL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const networkFirst = event.request.mode === "navigate" || NETWORK_FIRST_PATHS.has(url.pathname);

  if (networkFirst) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok || response.type === "opaque") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached ?? caches.match("/index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok || response.type === "opaque") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});

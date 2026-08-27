const CACHE_NAME = "brembo-dashboard-v3";

const APP_SHELL = [
  "/brembo-dashboard/",
  "/brembo-dashboard/index.html",
  "/brembo-dashboard/manifest.json",
  "/brembo-dashboard/icon-192.png",
  "/brembo-dashboard/icon-512.png"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH — NETWORK FIRST
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {

        if (response && response.status === 200) {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, copy);
            });
        }

        return response;
      })

      .catch(() => {
        return caches.match(event.request);
      })
  );

});

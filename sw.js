const CACHE_NAME = "brembo-dashboard-v4";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(APP_SHELL).catch(function(error) {
          console.warn("Cache install warning:", error);
        });
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(
          keys
            .filter(function(key) {
              return key !== CACHE_NAME;
            })
            .map(function(key) {
              return caches.delete(key);
            })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function(event) {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(response) {

        if (response && response.status === 200) {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, copy);
            })
            .catch(function(error) {
              console.warn("Cache update warning:", error);
            });
        }

        return response;
      })
      .catch(function() {

        return caches.match(event.request)
          .then(function(cachedResponse) {

            if (cachedResponse) {
              return cachedResponse;
            }

            return new Response(
              "Offline - Please check your internet connection.",
              {
                status: 503,
                headers: {
                  "Content-Type": "text/plain"
                }
              }
            );
          });
      })
  );

});

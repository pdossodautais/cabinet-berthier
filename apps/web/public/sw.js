/// <reference lib="webworker" />

const CACHE_NAME = "immo-v1";
const OFFLINE_URL = "/offline";

// Assets statiques à pré-cacher
const PRECACHE_URLS = ["/offline", "/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignorer les requêtes non-GET et les APIs
  if (request.method !== "GET") return;
  if (request.url.includes("/api/")) return;
  if (request.url.includes("_next/")) return;
  if (request.url.includes("supabase.co")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Mettre en cache les pages HTML visitées
        if (response.ok && request.mode === "navigate") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline : servir la version en cache ou la page offline
        return caches
          .match(request)
          .then((cached) => cached || caches.match(OFFLINE_URL))
          .then((response) => response || new Response("Hors ligne", { status: 503 }));
      }),
  );
});

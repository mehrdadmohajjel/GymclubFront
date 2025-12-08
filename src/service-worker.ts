/// <reference lib="webworker" />

export {}; // اجباری برای ماژول شدن

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = "gymmgr-v1";
const urlsToCache = ["/", "/index.html"];

/* Install */
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

/* Activate */
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

/* Fetch */
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

const CACHE_NAME = "minutes-app-cache-v1";

// These are all the files the app needs to run offline, including the Quill library
const assetsToCache = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css",
    "https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js"
];

// 1. Install Event: The browser downloads and caches our assets
self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Caching assets...");
            return cache.addAll(assetsToCache);
        })
    );
});

// 2. Fetch Event: The app intercepts network requests and serves the cached files
self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(cachedResponse => {
            // Return the cached version if we have it, otherwise try to fetch from the network
            return cachedResponse || fetch(fetchEvent.request);
        })
    );
});
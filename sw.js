// Minimal service worker — makes the app installable and loads instantly offline.
const CACHE = "clueless-closet-v3";
const ASSETS = [
  "./", "./index.html", "./style.css", "./app.js", "./wardrobe.js", "./seed.js",
  "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // always hit the network for weather; cache-first for app assets
  if (url.hostname.includes("open-meteo")) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

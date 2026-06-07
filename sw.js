const CACHE="melissa-recipe-binder-lifelike-icons-v3";
const FILES=["./","index.html","style.css","app.js","manifest.json","sw.js","icon-192.png","icon-512.png","splash-logo.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

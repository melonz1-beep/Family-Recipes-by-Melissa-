const CACHE="melissa-recipe-binder-lifelike-icons-v5";
const FILES=["./","index.html","style.css","app.js","manifest.json","sw.js","icon-192.png","icon-512.png","splash-logo.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
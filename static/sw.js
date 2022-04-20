importScripts('./palladium/palladium.sw.js');

const sw = new PalladiumServiceWorker();

self.addEventListener('fetch', event =>
    event.respondWith(
        sw.fetch(event)
    )
);
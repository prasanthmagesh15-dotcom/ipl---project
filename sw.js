const CACHE_NAME = 'agrismart-v1';
const APP_FILES = [
  './',
  './index.html',
  './welcome.html',
  './login.html',
  './create-account.html',
  './kumar.html',
  './kumar-sensor.html',
  './kumar-alerts.html',
  './ravi.html',
  './ravi-sensor.html',
  './ravi-alerts.html',
  './capture.html',
  './disease.html',
  './crop.html',
  './ai.html',
  './map.html',
  './weather.html',
  './reports.html',
  './settings.html',
  './help.html',
  './about.html',
  './wifi.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon.svg',
  './WhatsApp Image 2026-11-11 at 4.12.25 PM.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached || caches.match('./index.html'));

      return cached || network;
    })
  );
});
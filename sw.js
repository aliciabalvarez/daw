/* Service worker: guarda la app para usarla sin conexión.
   Si añades archivos nuevos, añádelos a ARCHIVOS y sube el número de VERSION. */
const VERSION = 'daw-v63';
const ARCHIVOS = [
  './', './index.html', './tutorias.html', './manifest.webmanifest',
  './assets/inicio.css', './assets/inicio.js', './assets/tutorias.js', './assets/icono.svg',
  './data/datos.js', './data/guardado.js',
  './asignaturas/dwec.html', './asignaturas/dwes.html', './asignaturas/python.html',
  './asignaturas/fcn.html', './asignaturas/dasp.html', './asignaturas/sasp.html', './asignaturas/despliegue.html'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Primero la red (para ver siempre lo último); si no hay conexión, la copia guardada. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok && new URL(e.request.url).origin === location.origin) {
        const copia = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copia));
      }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

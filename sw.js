/* Service worker: guarda la app para usarla sin conexión.
   Si añades archivos nuevos, añádelos a ARCHIVOS y sube el número de VERSION. */
const VERSION = 'daw-v66';
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
  const url = new URL(e.request.url);
  // 'no-cache': pregunta siempre al servidor si hay versión nueva (GitHub Pages manda max-age=600)
  const red = url.origin !== location.origin ? fetch(e.request)
    : e.request.mode === 'navigate'
      ? fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }).then(r => r.redirected ? fetch(e.request) : r)
      : fetch(e.request, { cache: 'no-cache' });
  e.respondWith(
    red.then(r => {
      if (r.ok && new URL(e.request.url).origin === location.origin) {
        const copia = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copia));
      }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

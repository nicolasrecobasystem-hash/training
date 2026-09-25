/* Service worker: permite abrir la app sin conexión (ejercicios, dibujos y temporizador).
   Estrategia "primero la red": si hay internet siempre carga la última versión publicada;
   si no hay, usa la última copia guardada. La música, la nube y las luces necesitan internet. */
var CACHE = 'mi-semana-v5';
var BASICO = ['./', 'index.html', 'mando.html', 'app.js', 'datos.js', 'estilos.css', 'mando.js', 'mando.css',
  'manifest.webmanifest', 'mando.webmanifest', 'iconos/icono-180.png', 'iconos/icono-192.png', 'iconos/icono-512.png',
  'iconos/mando-180.png', 'iconos/mando-192.png', 'iconos/mando-512.png'];
// Recursos de fuera que también se guardan (letras y la librería de la nube)
var DE_FUERA = /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net\/npm\/@supabase)/;

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(BASICO); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var propio = url.origin === self.location.origin;
  if (!propio && !DE_FUERA.test(req.url)) return;   // YouTube, Supabase (datos), Govee: siempre directo
  e.respondWith(
    fetch(req).then(function (r) {
      if (r && (r.ok || r.type === 'opaque')) { var copia = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copia); }); }
      return r;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: propio }).then(function (r) { return r || caches.match('index.html'); });
    })
  );
});

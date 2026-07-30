/* Service worker de ttrNow.
 *
 * Solo existe cuando la app está servida desde un hosting. El archivo
 * ttrNow.html suelto sigue siendo autosuficiente y no lo necesita: si no
 * encuentra este fichero, no pasa nada y la app funciona igual.
 *
 * Lo que aporta: que abrir la app desde la pantalla de inicio funcione sin
 * cobertura, en un avión, para siempre. Los datos ya viven en IndexedDB;
 * esto solo guarda el propio programa.
 */
const CACHE = 'ttrnow-v1';
const CORE = ['./', './ttrNow.html'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

const conTiempo = (p, ms) => new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error('sin red')), ms);
  p.then(v => { clearTimeout(t); res(v); }, e => { clearTimeout(t); rej(e); });
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  let url;
  try { url = new URL(r.url); } catch (err) { return; }
  if (url.origin !== location.origin) return;

  /* Red primero, para que una versión nueva llegue sola en cuanto abras la
     app con cobertura. Caché en cuanto la red falla o tarda demasiado, que
     es lo que convierte esto en una app de avión. */
  e.respondWith((async () => {
    try {
      const res = await conTiempo(fetch(r), r.mode === 'navigate' ? 2200 : 6000);
      if (res && res.ok) {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(r, copia)).catch(() => {});
      }
      return res;
    } catch (err) {
      const hit = await caches.match(r, { ignoreSearch: true });
      if (hit) return hit;
      if (r.mode === 'navigate') {
        const casa = (await caches.match('./ttrNow.html')) || (await caches.match('./'));
        if (casa) return casa;
      }
      throw err;
    }
  })());
});

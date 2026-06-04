const CACHE_NAME = 'blackwood-manor-v10';
const APP_SHELL = [
  './',
  './index.html?v=10',
  './styles.css?v=10',
  './app.js?v=10',
  './case-blackwood-manor.json',
  './manifest.webmanifest?v=10',
  './icon.svg',
  './assets/images/manor-exterior.png',
  './assets/images/dining-room.png',
  './assets/images/scene-murder.png',
  './assets/images/scene-inspector.png',
  './assets/images/locked-medical-vial.png',
  './assets/images/char-margaret.png',
  './assets/images/char-clara.png',
  './assets/images/char-victor.png',
  './assets/images/char-dr-ward.png',
  './assets/images/char-thomas.png',
  './assets/images/char-evelyn.png',
  './assets/images/clues/clue-flooded-road.png',
  './assets/images/clues/clue-tonic-bottle.png',
  './assets/images/clues/clue-blackout.png',
  './assets/images/clues/clue-west-wing-sale.png',
  './assets/images/clues/clue-victor-debt.png',
  './assets/images/clues/clue-bottle-switch.png',
  './assets/images/clues/clue-old-letters.png',
  './assets/images/clues/clue-midnight-note.png',
  './assets/images/clues/clue-medical-bag.png',
  './assets/images/clues/clue-sideboard.png',
  './assets/video/blackwood-intro.mp4'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./index.html?v=10')))
  );
});

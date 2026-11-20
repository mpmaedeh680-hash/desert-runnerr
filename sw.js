const CACHE = 'runner-v1';
const FILES = [
  './', './index.html', './style.css',
  './colors.js', './audio.js', './draw.js', './game.js',
  './icon-192.png', './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
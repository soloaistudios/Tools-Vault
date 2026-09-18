const CACHE_NAME = 'toolvault-v10';
const APP_SHELL = ['index.html','tools.html','categories.html','tool.html','compare.html','blog.html','about.html','contact.html','style.css','responsive.css','polish.css','compare.css','app.js','tools.js','categories.js','search.js','filters.js','tool-details.js','compare.js','compare-page.js','blog.js','affiliate-config.js','affiliate.js','analytics-config.js','analytics.js','site-seo.js','site-enhancements.js','tools.json','categories.json','blog.json','manifest.json','icon-192.svg','icon-512.svg'];
const HTML_OR_DATA = /\.(?:html|js|css|json)(?:[?#].*)?$/i;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'TOOLVAULT_BUILD_CHECK') {
    event.source?.postMessage?.({ type: 'TOOLVAULT_BUILD_ACK', build: CACHE_NAME });
  }
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const request = event.request;
  const url = new URL(request.url);
  const isAppAsset = url.origin === self.location.origin && HTML_OR_DATA.test(url.pathname + url.search);

  if (!isAppAsset) {
    event.respondWith(
      caches.match(request)
        .then(cached => cached || fetch(request))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then(cached =>
        cached || caches.match(url.pathname, {ignoreSearch: true}) || caches.match('index.html')
      ))
  );
});

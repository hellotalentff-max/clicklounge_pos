const CACHE_NAME = 'clicklounge-pos-v60';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(['/'])).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = e.request.url;

  // NEVER intercept Google Apps Script or API calls
  if (url.includes('script.google.com') || url.includes('googleapis.com') || url.includes('callback=_gcb_')) {
    return;
  }

  // Only handle same-origin requests
  if (url.startsWith(self.location.origin)) {
    e.respondWith(
      fetch(e.request, {cache: 'no-store'})
        .then(res => {
          if (res && res.status === 200 && res.type !== 'opaque') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'FLUSH_QUEUE') {
    self.clients.matchAll().then(clients => clients.forEach(c => c.postMessage({type: 'FLUSH_QUEUE'})));
  }
});

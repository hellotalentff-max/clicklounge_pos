const CACHE_NAME = 'clicklounge-pos-v46';

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
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, {cache:'no-store'})
      .then(res => {
        if(res && res.status === 200){
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(()=>{});
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('message', e => {
  if(e.data && e.data.type === 'FLUSH_QUEUE'){
    self.clients.matchAll().then(clients => clients.forEach(c => c.postMessage({type:'FLUSH_QUEUE'})));
  }
});

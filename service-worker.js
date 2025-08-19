const CACHE = 'rbx-lookup-v1';
const ASSETS = ['/', '/manifest.json'];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  const {request} = e;
  if (request.method !== 'GET') return;
  e.respondWith(
    caches.match(request).then(cached=>{
      const fetcher = fetch(request).then(resp=>{
        if (resp.ok && (resp.type==='basic' || resp.type==='opaque')) {
          const clone = resp.clone(); caches.open(CACHE).then(c=>c.put(request, clone));
        }
        return resp;
      }).catch(()=> cached);
      return cached || fetcher;
    })
  );
});

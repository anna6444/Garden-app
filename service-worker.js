const CACHE_NAME = "garden-v2";
// 需要离线缓存的本地静态文件
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// 安装：预缓存静态资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()) // 立刻启用新SW
  );
});

// 激活：清理旧版本缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(oldCache => caches.delete(oldCache))
      );
    }).then(() => self.clients.claim())
  );
});

// 请求拦截
self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Supabase数据库、存储桶图片：直接走网络，不缓存
  if(req.url.includes("supabase.co")){
    event.respondWith(fetch(req));
    return;
  }
  // 静态资源：缓存优先，后台更新
  event.respondWith(
    caches.match(req)
      .then(cachedRes => {
        const fetchPromise = fetch(req).then(networkRes => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, networkRes.clone());
          });
          return networkRes;
        });
        return cachedRes || fetchPromise;
      })
  );
});

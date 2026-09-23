const CACHE_NAME = "garden-v6";
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

  // Supabase 数据库、存储桶：直接走网络，不缓存
  if(req.url.includes("supabase.co")){
    event.respondWith(fetch(req));
    return;
  }

  // 静态资源：网络优先，失败才用缓存
  event.respondWith(
    fetch(req)
      .then(networkRes => {
        const clone = networkRes.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        return networkRes;
      })
      .catch(() => caches.match(req))
  );
});

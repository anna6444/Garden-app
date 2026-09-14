const CACHE_NAME = 'garden-v1';

// 需要缓存的页面文件

const FILES_TO_CACHE = [

  './index.html',

  './manifest.json'
];



// 安装：缓存文件

self.addEventListener('install', (evt) => {

  evt.waitUntil(

    caches.open(CACHE_NAME).then((cache) => {

      return cache.addAll(FILES_TO_CACHE);

    })

  );

  self.skipWaiting();

});




// 激活：清理旧缓存

self.addEventListener('activate', (evt) => {

  evt.waitUntil(

    caches.keys().then((keyList) => {

      return Promise.all(keyList.map((key) => {

        if (key !== CACHE_NAME) return caches.delete(key);

      }));

    })

  );

  self.clients.claim();

});


// 请求拦截：优先读缓存

self.addEventListener('fetch', (evt) => {

  evt.respondWith(

    caches.match(evt.request).then((response) => {

      return response || fetch(evt.request);

    })

  );

});
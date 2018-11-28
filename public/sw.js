// 定义缓存目录, 等待service worker安装完成后缓存资源
const cacheName = 'sw-cache-0'
const cacheFiles = [
  '/',
  './index.html',
  './index.js',
  './style.css',
  './dest.png',
  '/searchMovies'
]

const cacheApiName = 'sw-cache-api-0'
const cacheApis = [
  '/searchMovies'
]

/**
 * service worker 加载完成先触发 installing
 * 
 * self为当前全局的特殊变量，self = service worker
 * 
 * caches为当前全局的特殊变量，caches = Cache
 */
self.addEventListener('install', async function (event) {
  console.log('service worker install success')
  // const cacheOpenPromise = caches.open(cacheName)
  // console.log('cacheOpenPromise', cacheOpenPromise)
  // event.waitUntil(cacheOpenPromise)
  // cacheOpenPromise.then(function (cache) {
  //   console.warn('add', cache)
  //   return cache.addAll(cacheFiles)
  // }).catch(err => {
  //   console.log('err cacheOpenPromise', err)
  // })
  event.waitUntil(self.skipWaiting());
})

self.addEventListener('fetch', async function (event) {
  console.log('event.request', event.request)

  const needApiCache = cacheApis.some((item) => {
    return event.request.url.indexOf(item) > -1
  })
  // url请求
  if (needApiCache) {
    console.log("neewApi", caches)
    caches.open(cacheApiName).then((cache) => {
      return fetch(event.request).then(res => {
        console.log('res', res, cache)
        cache.add(event.request.url, res.clone())
        return res
      })
    })
  } else {
    console.log("respondWith", caches)
    // 静态资源缓存 
    event.respondWith(caches.match(event.request).then(cache => {
      console.log('cache', cache)
      return cache || fetch(event.request)
    }).catch(err => {
      console.log('err respondWith', err)
      return fetch(event.request);
    }))
  }
})


self.addEventListener('activite', event => {
  console.log('activite')
})

/**
 * notification event method
 */
self.addEventListener('notificationclick', function(e) {
  e.waitUntil(self.clients.matchAll().then(async (clientList) => {
    console.log('clientList', clientList)
    if (clientList && !clientList.length) {
      console.log('open')
      self.clients.openWindow('http://localhost:8080');
    }
    for (var i = 0; i < clientList.length; i++) {
      clientList[i].focus()
    }
  }))
})

self.addEventListener('push', function (e) {
  if (e.data) {
    const data = e.data
    console.log('se', self.registration.showNotifition)
    console.log('push msg: ', data)
    console.log('push msg: ', data.json())
    console.log('push msg: ', data.text())
    self.registration.showNotification(data.text(), {
      body: '这是后端推送过来的',
      renotify: true
    })
  }
})

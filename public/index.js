/**
 * 注册service worker
 */
async function registerServiceWorker(url) {
  return navigator.serviceWorker.register(url, {
    scope: '/'
  })
  .then(registration => {
    console.log('Service Worker successfully registered')
    return registration
  })
  .catch(err => {
    console.log('registration error', err)
  })
}

/**
 * 订阅serviceWorker.pushManager.subscribe服务
 * @return 返回subscription对象
 */
function subscribeUserToPush(registration, publicKey) {
  var options = {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  }
  return registration.pushManager.subscribe(options).then((subscription) => {
    console.log('get the subscription', JSON.stringify(subscription))
    return subscription
  })
}

/**
 * 推送到服务端
 */
async function sendSubscriptionToServer (data) {
  fetch('/subscriptionClient', {
    body: data,
    method: 'post',
    mode: 'cors',
    headers: {
      "content-type": 'application/json'
    }
  }).then(res => {
    console.log('subscribe success', res)
    return res.json()
  })
}

function execute() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    var publicKey = 'BAB0YD5yrbgb74rRfdG4gAdK21E38LACHL8s7TmCLNWZVfD_e2k4QTBJSbF4KM3qI2D9HCrvQYZ997GtbOwIi00';
    // 注册service worker
    registerServiceWorker('./sw.js?t=' + new Date().getTime()).then(function (registration) {
      console.log('Service Worker 注册成功');
      window.registration = registration
      // 开启该客户端的消息推送订阅功能
      return subscribeUserToPush(registration, publicKey);
    }).then(function (subscription) {
      var body = {subscription: subscription};
      // 为了方便之后的推送，为每个客户端简单生成一个标识
      body.uniqueid = new Date().getTime();
      console.log('uniqueid', body.uniqueid);
      // 将生成的客户端订阅信息存储在自己的服务器上
      return sendSubscriptionToServer(JSON.stringify(body));
    }).then(function (res) {
        console.log(res);
    }).catch(function (err) {
        console.log(err);
    });
  }
}

const getDom = (id) => {
  return document.getElementById(id)
}

function renderList(res) {
  let ulList = getDom('ul-list')
  ulList.innerHTML = ''
  res.data.subjects.forEach(item => {
    const li = document.createElement('li')
    li.innerText = item.title
    ulList.append(li)
  })
}

function getApiDataFromCache(url) {
  return caches.match(url).then(function(cache) {
    // console.log('cache.json()', cache.json())
    return cache.json()
  })
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

(() => {
  const btnSearch = getDom('btn-search')
  const btnSubscribe = getDom('subscribe')
  btnSearch.onclick = async function() {
    const url = '/searchMovies?count=2&title=' + encodeURI(getDom('input-text').value)
    const res = await fetch(url).then(res => res.json())
    getApiDataFromCache(url).then(res => {
      console.log('getApiDataFromCache', res)
      renderList(res)
    })
  }

  btnSubscribe.onclick = async function (){
    self.registration.showNotification('click but', {
      body: '邀请你一起学习',
      actions: [{
        title: 'go to see',
        action: 'goto'
      }, {
        title: 'close it',
        action: 'close'
      }],
      tag: 'pwa-starter',
      renotify: true
    })
  }
  
  if (!('serviceWorker' in navigator)) {
    return
  }
  if (!('PushManager' in window)) {
    return
  }
  new Promise((r, j) => {
    Notification.requestPermission(res => {
      r(res)
    })
  }).then(res => {
    console.log('permission', res)
    if (res === 'granted') {
      execute()
    } else {
      console.log('no permission')
    }
  })
})()
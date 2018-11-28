const http = require('http')
const path = require('path')
const Koa = require('koa')
const serve = require('koa-static')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const webpush = require('web-push')
const { getData, postData } = require('./util').default

const vapidKeys = {
  publicKey: 'BAB0YD5yrbgb74rRfdG4gAdK21E38LACHL8s7TmCLNWZVfD_e2k4QTBJSbF4KM3qI2D9HCrvQYZ997GtbOwIi00',
  privateKey: 'xL78BPzyjZIkja8__38KYbC9vhgy-m2Jur9-LutOoKU'
}
// const vapidKeys = webpush.generateVAPIDKeys()
console.log('vapidKeys', vapidKeys)
// setting web push vapid
webpush.setVapidDetails('mailto:609780590@qq.com', vapidKeys.publicKey, vapidKeys.privateKey)

const port = process.env.PORT || 8080
const app = new Koa()
const router = new Router()

app.use(bodyParser())

const resData = (data, errorObj) => {
  return errorObj ? Object.assign({}, errorObj, data): Object.assign({ status: 0, msg: 'success', data })
}

/**
 * 获取热片top20
 */
router.get('/topMovies', async (ctx, next) => {
  const data = JSON.parse(await getData('https://api.douban.com/v2/movie/in_theaters'))
  ctx.response.body = resData(data)
})

/**
 * 按片名查询
 */
router.get('/searchMovies', async (ctx, next) => {
  const { title, count } = { ...ctx.request.query }
  const url = `https://api.douban.com/v2/movie/search?start=0&count=${count || 10}&q=${title}`
  console.log('url', url)
  const data = JSON.parse(await getData(url))
  ctx.response.body = resData(data)
})

const clientList = {}
// ===============webpush===============
router.post('/subscriptionClient', async (ctx, next) => {
  const data = ctx.request.body
  console.log(data)
  clientList[data.uniqueid] = data.subscription

  console.log(data.uniqueid)
  ctx.response.body = resData({})

  setTimeout(() => {
    webpush.sendNotification(
      data.subscription,
      JSON.stringify({title: 'this is from server'}),
      {
        headers: {a: 123},
        TTL: 10
      }
    ).then(res => {
      console.log('push service data', JSON.stringify(res))
    }).catch(err => {
      console.log('err', err)
    })
  }, 1000)
})


app.use(router.routes())
app.use(serve(path.join(__dirname + '/public')))
app.listen(port, () => {
  console.log('server is running on port: %s', port)
})

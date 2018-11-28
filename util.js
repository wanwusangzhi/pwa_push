const request = require('request')

const getData = (url = '', payload = {}, options) => {
  return new Promise((resolve, reject) => {
    const req = request.get(url, params=payload , (err, res, body) => {
      if (err) {
        reject(err)
        return
      }
      resolve(body)
    })
  })
}

const postData = (url = '', data = {}, options) => {
  return new Promise((resolve, reject) => {
    request.post(url, data=data, (err, res, body) => {
      if (err) {
        reject(err)
        return
      }
      resolve(body)
    })
  })
}

exports.default = {
  getData,
  postData
}
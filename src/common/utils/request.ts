import request from 'superagent'


const responseCacheStorage = {}

const responseCacheGetKey = (req, opts) => `${opts.method}-${opts.endpoint}`

const responseCacheGet = (req, opts) => {
  const cacheKey =  responseCacheGetKey(req, opts)

  if (opts
    && opts.cacheResponse
    && responseCacheStorage[cacheKey]
    && ((responseCacheStorage[cacheKey].cacheResponseCreateTime + responseCacheStorage[cacheKey].cacheResponse) >= new Date().getTime())
  ) {
    return responseCacheStorage[cacheKey]
  } return false
}

const responseCacheAdd = (req, opts, resData, res) => {
  const cacheKey = responseCacheGetKey(req, opts)
  const { cacheResponse } = opts
  const cacheResponseCreateTime = new Date().getTime()

  responseCacheStorage[cacheKey] = {
    cacheResponse,
    cacheResponseCreateTime,
    resData,
    res,
  }
}

const createResponseHandler = (req, opts) => {
  const debug = `${opts.method.toUpperCase()} ${opts.endpoint}`

  // cached answer
  const cachedAnswer = responseCacheGet(req, opts)

  if (cachedAnswer) {
    return new Promise((fulfill, reject) => {
      //@ts-ignore
      fulfill(cachedAnswer.resData, cachedAnswer.res)
    })
  }

  // no cache - do request
  return new Promise((fulfill, reject) => req.end((err, res) => {
    let serverError

    if (opts.sourceError && err) {
      return reject(err)
    }

    // Errors
    if (!res && !err) {
      serverError = `Connection failed: ${debug}`
    }
    else if (!res || res.statusCode >= 500) {
      serverError = 'We`re having technical issues at that moment. Please try again later'
    }

    if (serverError) {
      return reject(new Error(`Connection failed: ${debug}, server error:${serverError}`))
    }

    if (err) {
      return reject({ resData: err, res })
    }

    let { body } = res


    if (!body) {
      try {
        body = JSON.parse(res.text)
      }
      catch (err) {
        return reject(err)
      }
    }

    const resData = opts.modifyResult(body)

    // Cache result if needs
    if (opts.cacheResponse) {
      responseCacheAdd(req, opts, resData, res)
    }

    // Resolve
    //@ts-ignore
    fulfill(resData, res)
  }))
}


const defaultOptions = {
  sameOrigin: false,
  modifyResult: (resData) => resData,
}

/**
 *
 * @param {Object} options
 * @param {String} options.endpoint
 * @param {String} options.method
 * @param {Object} options.headers
 * @param {Object} options.query
 * @param {Object} options.body
 * @param {number} options.delay
 */
const sendRequest = (options) => {
  const opts = { ...defaultOptions, ...options }
  const req = request[opts.method](opts.endpoint)

  // req.set({
  //   'Content-Type': opts.formData ? 'application/x-www-form-urlencoded; charset=UTF-8' : 'application/json',
  //   ...(opts.headers || {}),
  // })

  if (opts.timeout) {
    req.timeout({
      response: 5000,  // Wait 5 seconds for the server to start sending,
      deadline: 60000, // but allow 1 minute for the file to finish loading.
      ...opts.timeout,
    })
  }

  if (opts.query) {
    req.query(opts.query)
  }

  if (opts.body) {
    req.send(opts.body)
  }

  if (opts.sameOrigin) {
    req.withCredentials()
  }

  const responseHandler = createResponseHandler(req, opts)
  //@ts-ignore
  responseHandler.abort = req.abort.bind(req)

  return responseHandler
}

const requestByMethod = (method) => (endpoint, opts = {}) => sendRequest({ ...opts, endpoint, method })


export default {
  get: requestByMethod('get'),
  post: requestByMethod('post'),
  patch: requestByMethod('patch'),
  put: requestByMethod('put'),
  delete: requestByMethod('delete'),
}

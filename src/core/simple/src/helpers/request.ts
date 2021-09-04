import request from 'request-promise-native'

const responseCacheStorage = {}
const responseQuery = {}
const responseQueryTimers = {}
const responseQueryTicks = 10


const responseQueryInit = (queryName) => {
  if (!responseQuery[queryName]) responseQuery[queryName] = []
  if (!responseQueryTimers[queryName]) {
    responseQueryTimers[queryName] = setTimeout(() => {
      responseQueryWorker(queryName)
    }, responseQueryTicks)
  }
}

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

const responseCacheGetTimeout = (req, opts) => {
  const cacheKey =  responseCacheGetKey(req, opts)

  if (opts
    && opts.cacheResponse
    && responseCacheStorage[cacheKey]
  ) {
    return responseCacheStorage[cacheKey]
  } return false
}

const responseCacheAdd = (req, opts, resData) => {
  const cacheKey = responseCacheGetKey(req, opts)
  const cacheResponse = opts.cacheResponse
  const cacheResponseCreateTime = new Date().getTime()

  responseCacheStorage[cacheKey] = {
    cacheResponse,
    cacheResponseCreateTime,
    resData,
  }
}

const responseQueryWorker = (queryName) => {
  if (responseQuery[queryName].length) {
    const queryChunk = responseQuery[queryName].shift()

    const {
      req,
      opts,
      opts: {
        inQuery: {
          delay,
        },
      },
      fulfill: onResolve,
      reject: onError,
    } = queryChunk

    const debug = `${opts.method.toUpperCase()} ${opts.endpoint}`
    createResponseHandler(req, opts).then((answer) => {
      onResolve(answer)
      responseQueryTimers[queryName] = setTimeout(() => {
        responseQueryWorker(queryName)
      }, (delay || responseQueryTicks) )

    }).catch((error) => {
      onError(error)
      responseQueryTimers[queryName] = setTimeout(() => {
        responseQueryWorker(queryName)
      }, (delay || responseQueryTicks) )
    })
  } else {
    responseQueryTimers[queryName] = setTimeout(() => {
      responseQueryWorker(queryName)
    }, responseQueryTicks)
  }
}

const createResponseHandler = (req, opts) => {
  const debug = `${opts.method.toUpperCase()} ${opts.endpoint}`

  const responseQueryTimeout = 1000
  // no cache - do request
  // cached answer
  const cachedAnswer = responseCacheGet(req, opts)

  if (cachedAnswer) {
    return new Promise((fulfill, reject) => {
      fulfill(cachedAnswer.resData)
      return
    })
  }

  const { inQuery } = opts
  if (inQuery && !inQuery.inited) {
    return new Promise((fulfill, reject) => {
      const { name: queryName } = inQuery

      responseQueryInit(queryName)
      responseQuery[queryName].push({
        req,
        opts: {
          ...opts,
          inQuery: {
            ...inQuery,
            inited: true,
          },
        },
        fulfill,
        reject,
      })
    })
  }

  return new Promise((fulfill, reject) => {
    req.then( answer => {
      if (opts.cacheResponse) {
        responseCacheAdd(req, opts, answer)
      }
      fulfill(answer)
    })
    .catch( error => {
      if (opts.cacheOnFail) {
        const cachedData = responseCacheGetTimeout(req, opts)
        if (cachedData) {
          fulfill(cachedData.resData)
          return
        }
      }
      reject(error)
    })
  })
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

  let req

  if (opts.body) {
    req = request[opts.method](opts.endpoint, { json: !!opts.json, body: opts.body })
  } else {
    req = request[opts.method](opts.endpoint)
  }

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

  if (opts.sameOrigin) {
    req.withCredentials()
  }

  const responseHandler = createResponseHandler(req, opts)
  //@ts-ignore
  responseHandler.abort = req.abort.bind(req)

  return responseHandler
}

const requestByMethod = (method) => (endpoint, opts) => sendRequest({ ...opts, endpoint, method })


export default {
  get: requestByMethod('get'),
  post: requestByMethod('post'),
  patch: requestByMethod('patch'),
  put: requestByMethod('put'),
  delete: requestByMethod('delete'),
}

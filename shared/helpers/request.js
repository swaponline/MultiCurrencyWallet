import request from 'superagent'


const createResponseHandler = (req, opts) => {
  const debug = `${opts.method.toUpperCase()} ${opts.endpoint}`

  return new Promise((fulfill, reject) => req.end((err, res) => {
    let serverError
    let body = res.body

    if (!body) {
      try {
        body = JSON.parse(res.text)
      }
      catch (err) {
        throw err
      }
    }

    // Errors

    if (!res && !err) {
      serverError = `Connection failed: ${debug}`
    }
    else if (!res || res.statusCode >= 500) {
      serverError = 'We`re having technical issues at that moment. Please try again later'
    }

    if (serverError) {
      throw new Error(serverError)
    }

    if (err) {
      // TODO write Error notifier
      opts.onComplete()
      return reject({ resData: body, err, res })
    }

    const resData = opts.modifyResult(body)

    // Resolve

    fulfill(resData, res)
    opts.onComplete()
  }))
}


const defaultOptions = {
  sameOrigin: false,
  modifyResult: (resData) => resData,
  onComplete: () => {},
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

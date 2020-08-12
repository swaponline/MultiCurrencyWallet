import request from './request'
import config from 'app-config'
import getUnixTimeStamp from './getUnixTimeStamp'


const apiStatuses = {}
const apiQuery = {}
const apiQueryTimers = {}
const apiQueryTicks = 10

const apiQueryTimer = (queryName) => {
  if (apiQuery[queryName].length) {
    const queryChunk = apiQuery[queryName].shift()
    const {
      method,
      api,
      endpoint,
      resolve: onResolve,
      error: onError,
      options,
      options: {
        inQuery: {
          delay,
        },
      },
    } = queryChunk

    apiLooper(method, api, endpoint, options).then((answer) => {
      onResolve(answer)
      apiQueryTimers[queryName] = setTimeout(() => {
        apiQueryTimer(queryName)
      }, delay)

    }).catch((error) => {
      onError(error)
      apiQueryTimers[queryName] = setTimeout(() => {
        apiQueryTimer(queryName)
      }, delay)
    })
  } else {
    apiQueryTimers[queryName] = setTimeout(() => {
      apiQueryTimer(queryName)
    }, apiQueryTicks)
  }
}

const apiQueryInit = (queryName) => {
  if (!apiQuery[queryName]) apiQuery[queryName] = []
  if (!apiQueryTimers[queryName]) { apiQueryTimers[queryName] = setTimeout(() => {
    apiQueryTimer(queryName)
  }, apiQueryTicks) }
}

const initApiStatus = (api) => {
  const stat = {
    name: api,
    endpoints: {},
    prior: [],
    last: false,
  }

  if (config.api[api] instanceof Array) {
    config.api[api].forEach((url, index) => {
      stat.endpoints[url] = {
        url,
        lastCheck: getUnixTimeStamp(),
        online: true,
      }
      stat.prior.push(url)
    })
    stat.last = config.api[api][config.api[api].length - 1]
  } else {
    stat.endpoints[config.api[api]] = {
      url: config.api[api],
      lastCheck: getUnixTimeStamp(),
      online: true,
    }
    stat.prior.push(config.api[api])
    stat.last = config.api[api]
  }
  apiStatuses[api] = stat
}

const switchNext = (api) => {
  if (apiStatuses[api]) {
    if (apiStatuses[api].prior[0] === apiStatuses[api].last) return false

    const apiPrioritet = apiStatuses[api].prior

    const current = apiPrioritet.shift()
    apiPrioritet.push(current)
    apiStatuses[api].prior = apiPrioritet
    apiStatuses[api].endpoints[current].online = false
    apiStatuses[api].endpoints[current].lastCheck = getUnixTimeStamp()

    return true
  }
  return false
}

const apiLooper = (method, api, endpoint, options) => {
  const {
    inQuery,
  } = options || {}

  if (inQuery && !inQuery.inited) {
    return new Promise((resolve, error) => {
      const { name } = inQuery
      const queryName = `${api}_${name}`

      apiQueryInit(queryName)

      apiQuery[queryName].push({
        method,
        api,
        endpoint,
        options: {
          ...options,
          inQuery: {
            ...inQuery,
            inited: true,
          },
        },
        resolve,
        error,
      })

    })
  }

  if (!apiStatuses[api]) initApiStatus(api)
  const apiStatus = apiStatuses[api]

  if (apiStatus) {
    return new Promise((resolve, error) => {
      const doRequest = () => {
        const currentEndpoint = apiStatus.endpoints[apiStatus.prior[0]]

        if (currentEndpoint.online) {
          const url = `${currentEndpoint.url}${endpoint}`
          request[method](url, options)
            .then((answer) => {
              if (options && options.checkStatus instanceof Function) {
                if (!options.checkStatus(answer)) {
                  console.error('Endpoint ', currentEndpoint.url, ' check status failed. May be down. Switch next')
                  if (switchNext(api)) {
                    doRequest()
                  } else {
                    error('All endpoints of api is offline')
                  }
                  return
                }
              }
              resolve(answer)
            })
            .catch(() => {
              console.error('Endpoint ', currentEndpoint.url, 'is offline. Switch next')
              if (switchNext(api)) {
                doRequest()
              } else {
                error('All endpoints of api is offline')
              }
            })
        } else {
          error('All endpoints of api is offline')
        }
      }
      doRequest()
    })
  }
  return new Promise((resolve, error) => { error('Api not found') })

}


export default {
  get: (api, endpoint, options) => apiLooper('get', api, endpoint, options),
  post: (api, endpoint, options) => apiLooper('post', api, endpoint, options),
}

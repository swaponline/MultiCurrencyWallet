import request from './request'
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

const initApiStatus = (name, apiServers) => {
  const stat = {
    name,
    endpoints: {},
    prior: [],
    last: false,
  }

  if (apiServers instanceof Array) {
    apiServers.forEach((url, index) => {
      stat.endpoints[url] = {
        url,
        lastCheck: getUnixTimeStamp(),
        online: true,
      }
      //@ts-ignore: strictNullChecks
      stat.prior.push(url)
    })
    stat.last = apiServers[apiServers.length - 1]
  } else {
    stat.endpoints[apiServers] = {
      url: apiServers,
      lastCheck: getUnixTimeStamp(),
      online: true,
    }
    //@ts-ignore: strictNullChecks
    stat.prior.push(apiServers)
    stat.last = apiServers
  }
  apiStatuses[name] = stat
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
    ignoreErrors,
    reportErrors,
  } = options || {}

  const {
    name: apiName,
    servers: apiServers,
  } = api

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

  if (!apiStatuses[apiName]) {
    initApiStatus(apiName, apiServers)
  }

  const apiStatus = apiStatuses[apiName]

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
            .catch((answer) => {
              if (reportErrors instanceof Function) {
                let skipDefResolve = false
                const swithToNextServer = reportErrors(
                  answer,
                  (resolveResult) => {
                    skipDefResolve = true
                    resolve(resolveResult)
                  },
                  (rejectResult) => {
                    error(rejectResult)
                  }
                )
                if (!swithToNextServer) {
                  if (!skipDefResolve) resolve(answer)
                  return
                }
              }
              if (ignoreErrors) {
                resolve(answer)
                return
              }
              if (switchNext(apiName)) {
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
  get: (api, endpoint, options?) => apiLooper('get', api, endpoint, options),
  post: (api, endpoint, options?) => apiLooper('post', api, endpoint, options),
}

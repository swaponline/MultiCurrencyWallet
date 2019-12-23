import request from './request'
import config from 'app-config'
import getUnixTimeStamp from './getUnixTimeStamp'


const apiStatuses = {}

const initApiStatus = (api) => {
  const stat = {
    name: api,
    endpoints: {},
    prior: [],
    last: false,
  }

  if (config.api[api] instanceof Array) {
    config.api[api].forEach((url,index) => {
      stat.endpoints[url] = {
        url,
        lastCheck: getUnixTimeStamp(),
        online: true,
      }
      stat.prior.push(url)
    })
    stat.last = config.api[api][config.api[api].length-1]
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
  if (!apiStatuses[api]) initApiStatus(api)
  const apiStatus = apiStatuses[api]

  if (apiStatus) {
    return new Promise( (resolve, error) => {
      const doRequest = () => {
        const currentEndpoint = apiStatus.endpoints[apiStatus.prior[0]]

        if (currentEndpoint.online) {
          const url = `${currentEndpoint.url}${endpoint}`
          request[method](url, options)
            .then( (answer) => {
              resolve(answer)
            })
            .catch( () => {
              console.error('Endpoint ', currentEndpoint.url, 'is offline. Switch next')
              if (switchNext(api)) {
                doRequest()
              } else {
                error('All endpoints of api is offline')
              }
            } )
        } else {
          error('All endpoints of api is offline')
        }
      }
      doRequest()
    })
  } else {
    return new Promise((resolve,error) => { error('Api not found') })
  }
}


export default {
  get: (api, endpoint, options ) => apiLooper('get', api, endpoint, options ),
  post: (api, endpoint, options ) => apiLooper('post', api, endpoint, options ),
}

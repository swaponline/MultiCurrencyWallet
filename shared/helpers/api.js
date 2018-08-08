import config from 'app-config'

let switchedApi = {};

const switchApiServer = (provider, server) => switchedApi[provider] = server

const getApiServer = (provider) => switchedApi[provider] || config.api[provider]

export default {
  switchApiServer,
  getApiServer
}

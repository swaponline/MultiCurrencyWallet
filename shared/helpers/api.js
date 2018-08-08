import config from 'app-config'
import { getState } from 'redux/core'

const getApiServer = (provider) => {
  const { apiServers } = getState()
  return (apiServers || {})[provider] || config.api[provider]
}

export default {
  getApiServer
}

import config from 'app-config'
import { getState } from 'redux/core'


const getApiServer = (provider) => {
  const { api: { servers } } = getState()
  return (servers || {})[provider] || config.api[provider]
}

export default {
  getApiServer,
}

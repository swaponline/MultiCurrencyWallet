import config from 'app-config'
import request from 'common/utils/request'
import { getState } from 'redux/core'


const getApiServer = (provider) => {
  const { api: { servers } } = getState()
  return (servers || {})[provider] || config.api[provider]
}

const asyncFetchApi = async (apiLink) => {
  return request.get(apiLink, { cacheResponse: 60000 })
}

export default {
  getApiServer,
  asyncFetchApi,
}

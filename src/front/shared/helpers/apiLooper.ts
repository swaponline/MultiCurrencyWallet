import config from 'app-config'
import apiLooper from '../../../common/utils/apiLooper'


export default {
  get: (api, endpoint, options?) => apiLooper.get(
    {
      name: api,
      servers: config.api[api],
    },
    endpoint,
    options
  ),
  post: (api, endpoint, options?) => apiLooper.post(
    {
      name: api,
      servers: config.api[api],
    },
    endpoint,
    options
  ),
}

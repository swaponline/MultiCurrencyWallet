import config from 'app-config'
import exConfig from 'helpers/externalConfig'
import apiLooper from '../../../common/utils/apiLooper'


export default {
  get: (api, endpoint, options?) => apiLooper.get(
    {
      name: api,
      servers: (exConfig && exConfig.opts && exConfig.opts.backendApis && exConfig.opts.backendApis[api])
        ? exConfig && exConfig.opts && exConfig.opts.backendApis && exConfig.opts.backendApis[api]
        : config.api[api],
    },
    endpoint,
    options
  ),
  post: (api, endpoint, options?) => apiLooper.post(
    {
      name: api,
      servers: (exConfig && exConfig.opts && exConfig.opts.backendApis && exConfig.opts.backendApis[api])
        ? exConfig && exConfig.opts && exConfig.opts.backendApis && exConfig.opts.backendApis[api]
        : config.api[api],
    },
    endpoint,
    options
  ),
}

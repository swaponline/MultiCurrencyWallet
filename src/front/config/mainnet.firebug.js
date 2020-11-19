import baseConfig from './default'
import config from './mainnet'


export default {
  env: 'development',
  entry: 'mainnet',
  local: 'online',

  base: `http://localhost:${baseConfig.http.port}/`,
  publicPath: `http://localhost:${baseConfig.http.port}${baseConfig.publicPath}`,

  firebug: true,

  ...config,
}

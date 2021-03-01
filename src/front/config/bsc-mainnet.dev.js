import baseConfig from './default'
import config from './bsc-mainnet'


export default {
  env: 'development',
  entry: 'mainnet',
  local: 'online',
  binance: true,

  base: `http://localhost:${baseConfig.http.port}/`,
  publicPath: `http://localhost:${baseConfig.http.port}${baseConfig.publicPath}`,

  ...config,
}

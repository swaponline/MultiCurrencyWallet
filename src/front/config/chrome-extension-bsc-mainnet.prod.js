import baseConfig from './default'
import config from './bsc-mainnet'

export default {
  env: 'production',
  entry: 'mainnet',
  local: 'local',
  dir: 'chrome-extension/application',
  binance: true,

  base: './',
  publicPath: `.${baseConfig.publicPath}`,

  ...config,
}

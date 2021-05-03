import baseConfig from './default'
import config from './bsc-testnet'
import moment from 'moment-with-locales-es6'

export default {
  env: 'production',
  entry: 'testnet',
  local: 'local',
  dir: 'chrome-extension/application',
  binance: true,

  base: './',
  publicPath: `.${baseConfig.publicPath}`,

  time: moment(Date.now()).format('LLLL'),

  ...config,
}

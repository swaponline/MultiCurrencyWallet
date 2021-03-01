import baseConfig from './default'
import config from './bsc-testnet'
import moment from 'moment-with-locales-es6'


export default {
  env: 'development',
  entry: 'testnet',
  local: 'online',
  binance: true,

  base: `http://${baseConfig.http.host}:${baseConfig.http.port}/`,
  publicPath: `http://${baseConfig.http.host}:${baseConfig.http.port}${baseConfig.publicPath}`,

  time: moment(Date.now()).format('LLLL'),

  ...config,
}

import baseConfig from './default'
import config from './testnet'
import moment from 'moment-with-locales-es6'


export default {
  env: 'development',
  entry: 'testnet',
  local: 'online',

  base: `http://${baseConfig.http.host}:${baseConfig.http.port}/`,
  publicPath: `http://${baseConfig.http.host}:${baseConfig.http.port}${baseConfig.publicPath}`,

  time: moment(Date.now()).format('LLLL'),
  firebug: true,

  ...config,
}

import baseConfig from './default'
import config from './testnet'
import moment from 'moment-with-locales-es6'


export default {
  env: 'development',
  entry: 'testnet',
  local: 'online',

  base: `https://port9001.swaponline.site/`,
  publicPath: `https://port9001.swaponline.site/`,

  time: moment(Date.now()).format('LLLL'),

  ...config,
}

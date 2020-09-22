import baseConfig from './default'
import config from './testnet'
import moment from 'moment-with-locales-es6'


export default {
  env: 'production',
  entry: 'testnet',
  local: 'online',
  dir: 'testnet',

  base: 'https://testnet.swaponline.io/',
  publicPath: `https://testnet.swaponline.io${baseConfig.publicPath}`,

  time: moment(Date.now()).format('LLLL'),

  ...config,
}

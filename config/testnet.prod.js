import baseConfig from './default'
import config from './testnet'
import moment from 'moment-with-locales-es6'


export default {
  env: 'production',
  entry: 'testnet',
  local: 'online',
  dir: 'testnet',

  base: 'https://testnet.Atomicswapwallet.io/',
  publicPath: `https://testnet.Atomicswapwallet.io${baseConfig.publicPath}`,

  time: moment(Date.now()).format('LLLL'),

  ...config,
}

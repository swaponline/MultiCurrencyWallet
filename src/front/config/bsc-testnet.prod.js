import baseConfig from './default'
import config from './bsc-testnet'
import moment from 'moment-with-locales-es6'


export default {
  env: 'production',
  entry: 'testnet',
  local: 'online',
  dir: 'bsc-testnet',
  binance: true,

  base: './',
  publicPath: process.argv[2] || `./`, // call build like: `npm run build:mainnet https://some-domain.com/` to add different origin

  time: moment(Date.now()).format('LLLL'),

  ...config,
}

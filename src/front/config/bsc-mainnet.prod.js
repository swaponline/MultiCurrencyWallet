import baseConfig from './default'
import config from './bsc-mainnet'


export default {
  env: 'production',
  entry: 'mainnet',
  local: 'online',
  dir: 'bsc-mainnet',
  binance: true,

  base: './',
  publicPath: process.argv[2] || `./`, // call build like: `npm run build:mainnet https://swaponline.github.io/` to add different origin

  ...config,
}

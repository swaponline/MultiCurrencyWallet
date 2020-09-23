import baseConfig from './default'
import config from './mainnet'


export default {
  env: 'production',
  entry: 'mainnet',
  local: 'online',
  dir: 'mainnet',

  base: './',
  publicPath: process.argv[2] || `./`, // call build like: `npm run build:mainnet https://swaponline.github.io/` to add different origin

  ...config,
}

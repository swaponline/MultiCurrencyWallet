import baseConfig from './default'
import config from './mainnet'


export default {
  env: 'production',
  entry: 'mainnet',
  local: 'online',
  dir: 'mainnet',

  base: 'https://swaponline.github.io/swap.react/',
  publicPath: `https://swaponline.github.io/swap.react${baseConfig.publicPath}`,

  ...config,
}

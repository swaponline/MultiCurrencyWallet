import baseConfig from './default'
import config from './mainnet'


export default {
  env: 'production',
  entry: 'mainnet',
  local: 'online',
  dir: 'mainnet',

  base: 'https://atomicswapwallet.io/',
  publicPath: `https://atomicswapwallet.io${baseConfig.publicPath}`,

  ...config,
}

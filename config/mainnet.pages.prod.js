import baseConfig from './default'
import config from './mainnet'


export default {
  env: 'production',
  entry: 'mainnet',
  local: 'online',
  dir: 'mainnet-pages',

  base: 'https://staging.swaponline.site/',
  publicPath: `https://staging.swaponline.site${baseConfig.publicPath}`,

  ...config,
}

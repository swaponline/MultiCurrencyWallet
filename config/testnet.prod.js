import baseConfig from './default'
import config from './_config'


export default {
  env: 'production',

  base: 'https://testnet.swap.online/',
  publicPath: `https://testnet.swap.online${baseConfig.publicPath}`,

  ...config,
}

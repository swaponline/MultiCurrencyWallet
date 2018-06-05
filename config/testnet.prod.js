import baseConfig from './default'
import config from './_testnet'


export default {
  env: 'production',
  entry: 'testnet',

  base: 'https://testnet.swap.online/',
  publicPath: `https://testnet.swap.online${baseConfig.publicPath}`,

  ...config,
}

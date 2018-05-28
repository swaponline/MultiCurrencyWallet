import baseConfig from './default'
import config from './_testnet'


export default {
  env: 'production',
  entry: 'testnet',

  base: 'https://wallet.swap.online/',
  publicPath: `https://wallet.swap.online${baseConfig.publicPath}`,

  ...config,
}

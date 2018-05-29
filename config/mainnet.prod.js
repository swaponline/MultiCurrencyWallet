import baseConfig from './default'
import config from './_mainnet'


export default {
  env: 'production',
  entry: 'mainnet',

  base: 'https://wallet.swap.online/',
  publicPath: `https://wallet.swap.online${baseConfig.publicPath}`,

  ...config,
}

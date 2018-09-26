import baseConfig from './default'
import config from './mainnet'


export default {
  env: 'production',
  entry: 'mainnet',

  base: 'https://swap.online/',
  publicPath: `https://swap.online${baseConfig.publicPath}`,

  ...config,
}

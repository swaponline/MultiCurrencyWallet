import baseConfig from './default'
import config from './_config'


export default {
  env: 'production',

  base: 'https://swap.online/',
  publicPath: `https://swap.online${baseConfig.publicPath}`,

  ...config,
}

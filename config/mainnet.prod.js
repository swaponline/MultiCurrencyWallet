import baseConfig from './default'
import config from './_mainnet'


export default {
  env: 'production',
  entry: 'mainnet',

  base: 'https://alpha.swaponline.com/',
  publicPath: `https://alpha.swaponline.com${baseConfig.publicPath}`,

  ...config,
}

import baseConfig from './default'
import config from './mainnet'


export default {
  env: 'production',
  entry: 'mainnet-local',
  local: 'local',

  base: './',
  publicPath: `.${baseConfig.publicPath}`,

  ...config,
}

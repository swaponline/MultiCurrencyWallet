import baseConfig from './default'
import config from './mainnet'


export default {
  env: 'production',
  entry: 'mainnet',
  local: 'local',
  dir: 'mainnet-local',

  base: './',
  publicPath: `.${baseConfig.publicPath}`,

  ...config,
}

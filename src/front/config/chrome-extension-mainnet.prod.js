import baseConfig from './default'
import config from './mainnet'


export default {
  env: 'production',
  entry: 'mainnet',
  local: 'local',
  dir: 'chrome-extension/application',

  base: './',
  publicPath: `.${baseConfig.publicPath}`,

  ...config,
}

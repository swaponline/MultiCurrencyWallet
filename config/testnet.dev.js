import baseConfig from './default'
import config from './_testnet'


export default {
  env: 'development',
  entry: 'testnet',

  base: `http://localhost:${baseConfig.http.port}/`,
  publicPath: `http://localhost:${baseConfig.http.port}${baseConfig.publicPath}`,

  ...config,
}

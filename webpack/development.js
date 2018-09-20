import config from 'app-config'


export default (webpackConfig) => {

  webpackConfig.output = {
    path: config.paths.base('build'),
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    publicPath: config.publicPath,
  }

  webpackConfig.node = {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  }

  webpackConfig.devtool = 'cheap-module-source-map'

  webpackConfig.devServer = {
    publicPath: webpackConfig.output.publicPath,
    stats: 'errors-only',
    noInfo: true,
    lazy: false,
  }

  webpackConfig.plugins.push()

  return webpackConfig
}

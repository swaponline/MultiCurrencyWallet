// import BundleAnalyzer from 'webpack-bundle-analyzer'
import config from 'app-config'


export default (webpackConfig) => {

  webpackConfig.output = {
    path: config.paths.base('build'),
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    publicPath: config.publicPath,
  }

  webpackConfig.resolve = {
    alias: {
      shared: config.paths.base('shared'),
      'swap.auth': config.paths.swapCoreDev('src/swap.auth'),
      'swap.orders': config.paths.swapCoreDev('src/swap.orders'),
      'swap.room': config.paths.swapCoreDev('src/swap.room'),
      'swap.app': config.paths.swapCoreDev('src/swap.app'),
      'swap.flows': config.paths.swapCoreDev('src/swap.flows'),
      'swap.swap': config.paths.swapCoreDev('src/swap.swap'),
      'swap.swaps': config.paths.swapCoreDev('src/swap.swaps'),
    },
    modules: [
      config.paths.base('client'),
      config.paths.base('shared'),
      config.paths.base('local_modules'),
      'node_modules',
      config.paths.swapCoreDev('swap.core/src'),
    ],
    extensions: [ '.js', '.jsx', '.scss' ],
    plugins: [],
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

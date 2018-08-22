import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
// import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import config from 'app-config'


export default (webpackConfig) => {

  webpackConfig.resolve = {
    alias: {
      shared: config.paths.base('shared'),
      'swap.auth': config.paths.swapCoreProd('swap.core/lib/swap.auth'),
      'swap.orders': config.paths.swapCoreProd('swap.core/lib/swap.orders'),
      'swap.room': config.paths.swapCoreProd('swap.core/lib/swap.room'),
      'swap.app': config.paths.swapCoreProd('swap.core/lib/swap.app'),
      'swap.flows': config.paths.swapCoreProd('swap.core/lib/swap.flows'),
      'swap.swap': config.paths.swapCoreProd('swap.core/lib/swap.swap'),
      'swap.swaps': config.paths.swapCoreProd('swap.core/lib/swap.swaps'),
    },
    modules: [
      config.paths.base('client'),
      config.paths.base('shared'),
      config.paths.base('local_modules'),
      'node_modules',
      config.paths.swapCoreProd('../node_modules'),
    ],
    extensions: [ '.js', '.jsx', '.scss' ],
    plugins: [],
  }

  webpackConfig.output = {
    path: config.paths.base(`build-${config.entry}`),
    filename: '[name].[hash:6].js',
    chunkFilename: '[id].[hash:6].chunk.js',
    publicPath: config.publicPath,
  }

  webpackConfig.module.rules = webpackConfig.module.rules.map((loader) => {
    if (loader.test.test('*.css') || loader.test.test('*.scss')) {
      loader.use = ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: loader.use.slice(1),
      })
    }
    return loader
  })

  webpackConfig.plugins.push(
    //  Perhaps it's the cause of errors during the swap process,
    //  so temporary commented.
    // new UglifyJsPlugin({
    // }),
    new ExtractTextPlugin({
      filename: '[name].[hash:6].css',
      allChunks: true,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      // this assumes your vendor imports exist in the node_modules directory
      minChunks: (module) => module.context && module.context.indexOf('node_modules') >= 0,
    }),
  )

  return webpackConfig
}

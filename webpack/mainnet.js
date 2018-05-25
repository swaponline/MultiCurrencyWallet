import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import config from 'app-config'


export default (webpackConfig) => {

  webpackConfig.output = {
    path: config.paths.base('build-mainnet'),
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    publicPath: config.publicPath,
  }

  webpackConfig.plugins.push(
    new UglifyJsPlugin({
      sourceMap: true,
      comments: false,
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
        screw_ie8: true,
      },
    }),
  )

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
    new ExtractTextPlugin({
      filename: '[name].css',
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

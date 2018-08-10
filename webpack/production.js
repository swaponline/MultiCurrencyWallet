import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import config from 'app-config'


export default (webpackConfig) => {

  webpackConfig.output = {
    path: config.paths.base(`build-${config.entry}`),
    filename: '[name].[hash:6].js',
    chunkFilename: '[id].[hash:6].chunk.js',
    publicPath: config.publicPath,
  }

  // webpackConfig.plugins.push(
  //   // new webpack.SourceMapDevToolPlugin({
  //   //   filename: '[file].[hash:6].map',
  //   //   append: `\n//# sourceMappingURL=[url]`,
  //   // }),
  // )

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
    // new UglifyJsPlugin({
    //   uglifyOptions: {
    //     ecma: 6,
    //     warnings: true,
    //   },
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

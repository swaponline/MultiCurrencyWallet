import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import config from 'app-config'


export default (webpackConfig) => {

  webpackConfig.output = {
    path: config.paths.base(`build-${config.entry}`),
    filename: '[name].[hash:6].js',
    chunkFilename: '[id].[hash:6].chunk.js',
    publicPath: config.publicPath,
  }

  webpackConfig.plugins.push(
    new UglifyJsPlugin({
      // sourceMap: true,
      // comments: false,
      // beautify: true,
      // compress: {
      //   dead_code: true,
      //   unused: true,
      //   conditionals: true,
      //   pure_getters: true,
      //   unsafe: true,
      //   unsafe_comps: true,
      //   warnings: false,
      //   screw_ie8: true,
      // },
      uglifyOptions:{
        output: {
          comments: false, // remove comments
        },
        compress: {
          unused: true,
          dead_code: true, // big one--strip code that will never execute
          warnings: false, // good for prod apps so users can't peek behind curtain
          drop_debugger: true,
          conditionals: true,
          evaluate: true,
          drop_console: true, // strips console statements
          sequences: true,
          booleans: true,
        },
      },
    }),
    // new webpack.SourceMapDevToolPlugin({
    //   filename: '[file].[hash:6].map',
    //   append: `\n//# sourceMappingURL=[url]`,
    // }),
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

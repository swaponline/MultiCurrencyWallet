import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import config from 'app-config'

import path from 'path'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin-legacy'
import externalConfig from './externalConfig'
import WebpackRequireFrom from 'webpack-require-from-naggertooth'


export default (webpackConfig) => {

  webpackConfig.output = {
    path: config.paths.base(`build-${config.dir}`),
    filename: '[name].[hash:6].js',
    chunkFilename: '[id].[hash:6].chunk.js',
    publicPath: config.publicPath,
  }

  webpackConfig.externals = {
    'react': 'React',
    'react-dom' : 'ReactDOM',
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
    // new TerserPlugin(),
    new WebpackRequireFrom({
      variableName: 'publicUrl',
      suppressErrors: true,
    }),
    new ExtractTextPlugin({
      filename: '[name].[hash:6].css',
      allChunks: true,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      // this assumes your vendor imports exist in the node_modules directory
      minChunks: (module) => module.context && module.context.indexOf('node_modules') >= 0,
    }),
    new CopyWebpackPlugin([
      {
        from: 'client/firebase-messaging-sw.js',
        to: '',
        toType: 'file',
      },
    ]),
    externalConfig(),
  )

  return webpackConfig
}

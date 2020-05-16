import config from 'app-config'

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

import path from 'path'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import externalConfig from './externalConfig'


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

  webpackConfig.plugins.push(
    // create new info file every compiling
    // new BundleAnalyzerPlugin({
    //   openAnalyzer: false,
    //   analyzerMode: "static",
    // }),
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

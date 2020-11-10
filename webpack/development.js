import config from 'app-config'

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

import path from 'path'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import externalConfig from './externalConfig'
import getUnixTimeStamp from '../src/common/utils/getUnixTimeStamp'


const ts = getUnixTimeStamp()

export default (webpackConfig) => {

  webpackConfig.output = {
    path: config.paths.base('build'),
    filename: `[name]-${ts}.js`,
    chunkFilename: `[id].chunk-${ts}.js`,
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
    // new BundleAnalyzerPlugin()
    new CopyWebpackPlugin([
      {
        from: 'src/front/client/firebase-messaging-sw.js',
        to: '',
        toType: 'file',
      },
    ]),
    externalConfig(),
  )

  return webpackConfig
}

import webpack from 'webpack'
import config from 'app-config'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin-legacy'
import externalConfig from './externalConfig'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

export default (webpackConfig) => {
  webpackConfig.mode = 'development'

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

  webpackConfig.devtool = false

  webpackConfig.devServer = {
    publicPath: webpackConfig.output.publicPath,
    stats: 'errors-only',
    noInfo: true,
    lazy: false,
  }

  webpackConfig.plugins.push(
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'static',
    //   reportFilename: webpackConfig.output.path,
    //   // analyzerMode: 'server',
    //   // analyzerHost: '127.0.0.1',
    //   // analyzerPort: '8888',
    //   // openAnalyzer: false, // do not auto open in browser
    // }),
    new webpack.SourceMapDevToolPlugin({
      filename: '[name].js.map',
      exclude: ['vendor.js']
    }),
    new TerserPlugin({
      cache: true,
      parallel: true,
    }),
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

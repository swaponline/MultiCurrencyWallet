import webpack from 'webpack'
import config from 'app-config'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin-legacy'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import externalConfig from './externalConfig'

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
  /* 
  * отключаем дефолтные карты кода и подключаем плагин для них
  */
  webpackConfig.devtool = false

  webpackConfig.devServer = {
    publicPath: webpackConfig.output.publicPath,
    stats: 'errors-only',
    noInfo: true,
    lazy: false,
  }

  webpackConfig.plugins.push(
    /* 
    * раскоментировать, запустить сборку и открыть указанный адрес 
    * просмотреть что грузиться в сборку
    * анализатор будет тормозить сборку если использовать постоянно
    */
    // new BundleAnalyzerPlugin({
    //   // analyzerMode: 'server', // в каком формате представлять данные
    //   // analyzerHost: '127.0.0.1',
    //   // analyzerPort: '8888',
    //   // openAnalyzer: false, // открывать ли автоматически в браузере
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

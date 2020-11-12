import config from 'app-config'
import CopyWebpackPlugin from 'copy-webpack-plugin'
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
  * build speed: slow
  * rebuild: faster
  * qualiry: original source (lines only)
  */
  webpackConfig.devtool = 'eval-cheap-module-source-map'

  webpackConfig.devServer = {
    publicPath: webpackConfig.output.publicPath,
    stats: 'errors-only',
    noInfo: true,
    lazy: false,
  }

  webpackConfig.optimization = {
    minimize: false,
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

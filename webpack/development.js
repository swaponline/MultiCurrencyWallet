import config from 'app-config'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
//import SpeedMeasurePlugin from "speed-measure-webpack-plugin"
import externalConfig from './externalConfig'
import ownBuffer from './ownBuffer'

/* 
* verbose output in console about build time
* for all loaders and plugins
* and showing quantity modules
*/


//const smp = new SpeedMeasurePlugin();
// export default smp.wrap((webpackConfig) => {
export default (webpackConfig) => {
  webpackConfig.mode = 'development'

  webpackConfig.output = {
    path: config.paths.base('build'),
    filename: '[name].[hash:6].js',
    chunkFilename: '[name].[hash:6].js',
    publicPath: config.publicPath,
  }

  webpackConfig.resolve.fallback.fs = false
  webpackConfig.resolve.fallback.net = false
  webpackConfig.resolve.fallback.tls = false

  /* 
  * build speed: slow
  * rebuild: faster
  * qualiry: original source (lines only)
  */
  webpackConfig.devtool = 'eval-cheap-module-source-map'
  
  webpackConfig.devServer = {
    publicPath: webpackConfig.output.publicPath,
    stats: 'errors-only',
  }
  
  webpackConfig.optimization = {
    minimize: false,
  }

  webpackConfig.plugins.push(
    ...externalConfig(),
    ownBuffer(),
  )

  if (config.firebug) {
    webpackConfig.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/common/firebug/',
            to: 'firebug/',
          },
        ],
      }),
    )
  }

  // uncomment, run the build, and view the result in the browser
  // analyzer brakes build

  // webpackConfig.plugins.push(
  //   new BundleAnalyzerPlugin({
  //     analyzerMode: 'server',
  //     analyzerHost: '127.0.0.1',
  //     analyzerPort: '8888',
  //   }),
  // )

  return webpackConfig
}

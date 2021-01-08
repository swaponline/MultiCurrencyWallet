import config from 'app-config'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
//import SpeedMeasurePlugin from "speed-measure-webpack-plugin"
import externalConfig from './externalConfig'

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

  // webpackConfig.node = {
  //   fs: 'empty',
  //   net: 'empty',
  //   tls: 'empty',
  // }
  /* 
  * build speed: slow
  * rebuild: faster
  * qualiry: original source (lines only)
  */
  webpackConfig.devtool = 'eval-cheap-module-source-map'
  
  webpackConfig.devServer = {
    publicPath: webpackConfig.output.publicPath,
  }
  
  webpackConfig.optimization = {
    minimize: false,
  }
  
  webpackConfig.plugins.push(externalConfig())

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

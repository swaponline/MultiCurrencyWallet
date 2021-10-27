import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import WebpackRequireFrom from 'webpack-require-from-naggertooth'
import config from 'app-config'
import webpack from 'webpack'

import externalConfig from './externalConfig'
import ownBuffer from './ownBuffer'


export default (webpackConfig) => {
  webpackConfig.mode = 'production'

  // `default` - через BUILD_TYPE Не указано, локальные, полные и билды теста
  const hashPrefix = (process && process.env && process.env.BUILD_TYPE) ? process.env.BUILD_TYPE : `default`

  webpackConfig.output = {
    path: config.paths.base(`build-${config.dir}`),
    filename: `${hashPrefix}-[name].[hash:6].js`,
    chunkFilename: `${hashPrefix}-[name].[hash:6].js`,
    publicPath: config.publicPath,
  }

  webpackConfig.externals = {
    'react': 'React',
    'react-dom' : 'ReactDOM',
  }
  /*
  * for production build is better to replace 'style-loader' on 'MiniCssExtractPlugin.loader'
  * works with styles more effectively
  */
  webpackConfig.module.rules = webpackConfig.module.rules.map((loader) => {
    if (loader.test.test('*.css') || loader.test.test('*.scss')) {
      loader.use[0] = MiniCssExtractPlugin.loader
    }
    return loader
  })

  webpackConfig.optimization = {
    minimize: true,
    removeEmptyChunks: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: 1,
          enforce: true,
        },
      }
    }
  }

  webpackConfig.devtool = false

  webpackConfig.plugins.push(
    new webpack.SourceMapDevToolPlugin({
      publicPath: config.publicPath,
      filename: `${hashPrefix}-[name].[hash:6].js.map`,
      fileContext: 'public',
      exclude: /(vendor.*)|(.*\.css)/,
    }),
    new WebpackRequireFrom({
      variableName: 'publicUrl',
      suppressErrors: true
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash:6].css',
    }),
    ...externalConfig(),
    ownBuffer(),
  )

  return webpackConfig
}

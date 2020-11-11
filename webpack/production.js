import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import WebpackRequireFrom from 'webpack-require-from-naggertooth'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin-legacy'
import externalConfig from './externalConfig'
import config from 'app-config'
import webpack from 'webpack'

export default (webpackConfig) => {
  webpackConfig.mode = 'production'

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
      // replace 'style-loader' -> 'MiniCssExtractPlugin.loader'
      loader.use[0] = {
        loader: MiniCssExtractPlugin.loader
      }
    }
    return loader
  })

  webpackConfig.optimization = {
    minimizer: [
      new TerserPlugin({
        cache: false,
        parallel: true,
        sourceMap: false,
      }),
    ],
    splitChunks: {
      chunks: 'async',
      minSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '~',
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }

  webpackConfig.devtool = false

  webpackConfig.plugins.push(
    new webpack.SourceMapDevToolPlugin({
      filename: '[name].js.map',
      exclude: ['vendor.js']
    }),
    new WebpackRequireFrom({
      variableName: 'publicUrl',
      suppressErrors: true,
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash:6].css',
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

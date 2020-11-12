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
  /* 
  * для production сборки лучше изменить 'style-loader' на 'MiniCssExtractPlugin.loader'
  * работает со стилями более эффективно
  */
  webpackConfig.module.rules = webpackConfig.module.rules.map((loader) => {
    if (loader.test.test('*.css') || loader.test.test('*.scss')) {
      loader.use[0] = {
        loader: MiniCssExtractPlugin.loader
      }
    }
    return loader
  })

  webpackConfig.optimization = {
    minimizer: [
      new TerserPlugin({
        parallel: true, // default -> os.cpus().length - 1
        sourceMap: false,
      }),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
    }
  }
  /* 
  * отключаем дефолтные карты кода 
  * и подключаем плагин для более точной настройки (см. plugins)
  */
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

import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import WebpackRequireFrom from 'webpack-require-from-naggertooth'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin-legacy'
import externalConfig from './externalConfig'
import config from 'app-config'


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

  webpackConfig.module.rules = [
    {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        'cache-loader',
        'css-loader',
      ],
    },
    {
      test: /\.scss$/,
      use: [
        MiniCssExtractPlugin.loader,
        'cache-loader',
        'css-loader',
        'sass-loader',
      ],
    },
    {
      test: /\.(js|jsx)$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-proposal-object-rest-spread']
        },
      },
    },
    {
      test: /images.*\.(png|ico|jpg|jpeg|gif|svg|mp4)(\?.*)?$/,
      loader: 'file-loader',
      options: {
        name: '[name]_[hash:6].[ext]',
        outputPath: 'images/',
      },
    },
    {
      test: /\.mp4$/,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        outputPath: '/',
        publicPath: `${config.publicPath}/`,
      },
    },
    {
      test: /fonts.*\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader',
      options: {
        name: '[name].[ext]',
        outputPath: 'fonts/',
        publicPath: `${config.publicPath}fonts/`,
        limit: 10000,
        mimetype: 'application/font-woff',
      },
    },
    {
      test: /fonts.*\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        outputPath: 'fonts/',
        publicPath: `${config.publicPath}fonts/`,
      },
    },
  ]

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

  webpackConfig.plugins.push(
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

import path from 'path'
import merge from 'webpack-merge'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import common from './common'


export default merge(common, {
  mode: 'production',
  output: {
    crossOriginLoading: 'anonymous',
    path: path.join(__dirname, 'build'),
    filename: '[name].[hash:6].js',
    chunkFilename: '[id].chunk.js',
    publicPath: '',
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'style-loader',
          }, {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                require('precss'), // eslint-disable-line
                require('autoprefixer'), // eslint-disable-line
              ],
            },
          }, {
            loader: 'sass-loader',
          }],
          publicPath: 'build',
        }),
      },
    ],
  },
  plugins: [
    new UglifyJsPlugin(),
    new ExtractTextPlugin({
      filename: 'app.css',
      disable: false,
      allChunks: true,
    }),
  ],
})

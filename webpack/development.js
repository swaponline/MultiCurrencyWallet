import path from 'path'
import autoprefixer from 'autoprefixer'
import merge from 'webpack-merge'
import common from './common'


export default merge(common, {
  mode: 'development',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
            options: { sourceMap: true },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: true,
              localIdentName: '[local]__[hash:base64:3]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins: () => [
                autoprefixer([
                  'Android >= 4',
                  'iOS >= 8',
                  'Chrome >= 30',
                  'Firefox >= 30',
                  'Explorer >= 10',
                  'Safari >= 8',
                  'Opera >= 20',
                ]),
              ],
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              data: '@import "scss/config/index";',
              includePaths: [
                path.join(process.cwd(), 'client'),
              ],
            },
          },
        ],
      },
    ],
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'build'),
    compress: true,
    historyApiFallback: true,
    hot: true,
    port: 9001,
    open: true,
    stats: 'errors-only',
    noInfo: true,
    lazy: false,
  },
})

import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CleanWebpackPlugin from 'clean-webpack-plugin'


export default {
  entry: [
    'babel-polyfill', './client/index.js',
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'img/',
              publicPath: 'img/',
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
              outputPath: 'fonts/',
              publicPath: 'fonts/',
            },
          },
        ],
      },
      {
        test: /\.html/,
        use: ['underscore-template-loader'],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  resolve: {
    alias: {
      'swap-core': path.resolve(__dirname, '../../swap-core/src/'),
    },
    modules: [
      path.resolve(__dirname, '../client'),
      path.resolve(__dirname, '../shared'),
      path.resolve(__dirname, '../local_modules'),
      'node_modules',
    ],
    extensions: [ '*', '.js', '.jsx' ],
  },
  plugins: [
    new CleanWebpackPlugin(['build']),
    new HtmlWebpackPlugin({
      title: 'Swap.Design',
      minify: {
        collapseWhitespace: true,
      },
      hash: true,
      template: './client/index.html',
      favicon: path.resolve(__dirname, '../client/img/favicon.ico'),
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ],
}

import webpack from 'webpack'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import WebappWebpackPlugin from 'webapp-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import AppConfigPlugin from 'app-config/webpack'
import config from 'app-config'
import rulesMap from './rules'


const rules = Object.keys(rulesMap)
  .map((k) => rulesMap[k])
  .map((rule) => Array.isArray(rule) ? rule : (rule.default || rule[config.env]))
  .reduce((result, rule) => result.concat(rule), [])

const globals = {
  'process.env': {
    'NODE_ENV': JSON.stringify(config.env),
    'ENTRY': JSON.stringify(config.entry),
    'TESTNET': config.entry === 'testnet',
    'MAINNET': config.entry === 'mainnet',
  },
  // TODO fix __CONFIG__ - remove it and check app-config/webpack to resolve in /client.js
  __CONFIG__: JSON.stringify(config),
}


const webpackConfig = {

  entry: {
    'app': config.paths.client('index.js'),
  },

  module: {
    rules,
  },

  node: {
    fs: 'empty',
  },

  resolve: {
    alias: {
      shared: config.paths.base('shared'),
      'swap.auth': config.paths.swapCore('src/swap.auth'),
      'swap.orders': config.paths.swapCore('src/swap.orders'),
      'swap.room': config.paths.swapCore('src/swap.room'),
      'swap.app': config.paths.swapCore('src/swap.app'),
      'swap.flows': config.paths.swapCore('src/swap.flows'),
      'swap.swap': config.paths.swapCore('src/swap.swap'),
      'swap.swaps': config.paths.swapCore('src/swap.swaps'),
    },
    modules: [
      config.paths.base('client'),
      config.paths.base('shared'),
      config.paths.base('local_modules'),
      'node_modules',
      config.paths.swapCore('swap.core/src'),
    ],
    extensions: [ '.js', '.jsx', '.scss' ],
    plugins: [],
  },

  plugins: [
    new AppConfigPlugin(),
    new webpack.DefinePlugin(globals),
    new webpack.ProvidePlugin({
      'swap.auth': 'swap.auth',
      'swap.orders': 'swap.orders',
      'swap.room': 'swap.room',
      'swap.app': 'swap.app',
      'swap.flows': 'swap.flows',
      'swap.swap': 'swap.swap',
      'swap.swaps': 'swap.swaps',
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new ProgressBarPlugin({ clear: false }),
    new WebappWebpackPlugin({
      logo: 'favicon.png',
      path: config.base,
    }),
    new HtmlWebpackPlugin({
      title: 'Swap.Online - Cryptocurrency Wallet with Atomic Swap Exchange',
      template: config.paths.client('index.html'),
      hash: false,
      filename: 'index.html',
      inject: 'body',
    }),
    new webpack.ContextReplacementPlugin(
      /\.\/locale$/,
      'empty-module',
      false,
      /js$/
    ),
  ],
}


export default webpackConfig

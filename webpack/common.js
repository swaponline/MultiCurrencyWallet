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
    'LOCAL': JSON.stringify(config.local),
    'TESTNET': config.entry === 'testnet',
    'MAINNET': config.entry === 'mainnet',
    'EXTENSION': config.dir === 'chrome-extension/application',
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
      'shared': config.paths.front('shared'),
      'domain': config.paths.common('domain'),
      'swap.auth': config.paths.core('swap.auth'),
      'swap.orders': config.paths.core('swap.orders'),
      'swap.room': config.paths.core('swap.room'),
      'swap.app': config.paths.core('swap.app'),
      'swap.flows': config.paths.core('swap.flows'),
      'swap.swap': config.paths.core('swap.swap'),
      'swap.swaps': config.paths.core('swap.swaps'),
    },
    modules: [
      config.paths.front('client'),
      config.paths.front('shared'),
      config.paths.front('local_modules'),
      config.paths.common('domain'),
      'node_modules',
      config.paths.core(''),
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
      favicons: {
        appName: 'Wallet',
        appDescription: 'Hot wallet',
      },
    }),
    new HtmlWebpackPlugin({
      title: 'Hot Wallet with p2p exchange',
      isWidget: config.isWidget,
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
    new webpack.NormalModuleReplacementPlugin(/^leveldown$/, (result) => {
      result.request = result.request.replace(/(leveldown)/,  config.paths.shared('helpers/leveldown'))
    }),
  ],
}


export default webpackConfig

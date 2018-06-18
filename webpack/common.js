import webpack from 'webpack'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
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

  resolve: {
    alias: {
      shared: config.paths.base('shared'),
      'swap.auth':  config.paths.base('shared/swap.app/swap.auth'),
      'swap.orders':  config.paths.base('shared/swap.app/swap.orders'),
      'swap.room':  config.paths.base('shared/swap.app/swap.room'),
      'swap.app':  config.paths.base('shared/swap.app/swap.app'),
      'swap.flows':  config.paths.base('shared/swap.app/swap.flows'),
      'swap.swap':  config.paths.base('shared/swap.app/swap.swap'),
      'swap.swaps':  config.paths.base('shared/swap.app/swap.swaps'),
    },
    modules: [
      config.paths.base('client'),
      config.paths.base('shared'),
      config.paths.base('local_modules'),
      'node_modules',
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
    new HtmlWebpackPlugin({
      title: 'Swap.Online',
      template: config.paths.client('index.html'),
      // favicon: config.paths.site('assets/favicon-32x32.png'),
      hash: false,
      filename: 'index.html',
      inject: 'body',
    }),
    new webpack.ContextReplacementPlugin(
      /moment[\/\\]locale$/,
      /en-gb|es/
    ),
  ],
}


export default webpackConfig

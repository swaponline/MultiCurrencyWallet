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
    'WEBPACK': JSON.stringify(config.webpack),
    'TESTNET': config.webpack === 'testnet',
    'MAINNET': config.webpack === 'mainnet',
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
  ],
}


export default webpackConfig

const webpack = require('webpack')


function AppConfigPlugin() {}
module.exports = AppConfigPlugin

AppConfigPlugin.prototype.apply = (compiler) => {
  compiler.hooks.normalModuleFactory.tap('AppConfigPlugin', nmf => {
    nmf.hooks.beforeResolve.tap('AppConfigPlugin', (result) => {

      if (/app-config$/.test(result.request)) {
        const definePlugin = new webpack.DefinePlugin({
          __CONFIG__: JSON.stringify(require(result.request)), // eslint-disable-line
        })
        definePlugin.apply(compiler)

        result.request += '/client'
      }
      return true
    })
  })
}

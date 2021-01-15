const webpack = require('webpack')


function AppConfigPlugin() {}
module.exports = AppConfigPlugin

AppConfigPlugin.prototype.apply = (compiler) => {

  compiler.plugin('normal-module-factory', nmf => {
    nmf.plugin('before-resolve', (result, callback) => {
      if (!result) {
        return callback()
      }

      if (/app-config$/.test(result.request)) {
        compiler.apply(new webpack.DefinePlugin({
          __CONFIG__: JSON.stringify(require(result.request)), // eslint-disable-line
        }))

        result.request += '/client'
      }
      return callback(null, result)
    })
  })
}

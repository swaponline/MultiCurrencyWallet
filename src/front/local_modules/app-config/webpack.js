const webpack = require('webpack')


function AppConfigPlugin() {}
module.exports = AppConfigPlugin
/*
AppConfigPlugin.prototype.apply = (compiler) => {

  compiler.hooks.normalModuleFactory.tap('app-config', (nmf) => {
    console.log('add before resolve')
    
    nmf.hooks.beforeResolve.tap({ name: 'app-config' } , (result, callback) => {
      //console.log('br', result.request)
      //console.log(callback)
      if (!result) {
        //console.log('no result')
        //return callback()
      }

      if (/app-config$/.test(result.request)) {
        //console.log('is our')
        compiler.apply(new webpack.DefinePlugin({
          __CONFIG__: JSON.stringify(require(result.request)), // eslint-disable-line
        }))

        result.request += '/client'
        console.log('new request', result.request)
      }
      //return callback(null, result)
    })
    
  })
  */
/*
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
  */
//}

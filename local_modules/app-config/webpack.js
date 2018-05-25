var webpack = require('webpack');

function AppConfigPlugin() {}
module.exports = AppConfigPlugin;

AppConfigPlugin.prototype.apply = function(compiler) {

  compiler.plugin('normal-module-factory', function(nmf) {
    nmf.plugin('before-resolve', function(result, callback) {
      if(!result) return callback();
      if(/app-config$/.test(result.request)) {
        compiler.apply(new webpack.DefinePlugin({
          __CONFIG__: JSON.stringify(require(result.request))
        }));

        result.request += '/client';
      }
      return callback(null, result);
    });
  });
};

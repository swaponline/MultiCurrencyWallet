const path      = require('path')
const modPath   = require('app-module-path')


modPath.addPath(path.join(__dirname, '../local_modules'))


require('core-js/stable')
require('regenerator-runtime/runtime')
require('@babel/register')

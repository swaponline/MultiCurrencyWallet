const path      = require('path')
const modPath   = require('app-module-path')


modPath.addPath(path.join(__dirname, '../local_modules'))


require('@babel/polyfill')
require('@babel/register')

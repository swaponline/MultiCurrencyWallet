
if (!require('fs').existsSync(__dirname + '/.env')) {
  console.log('Please, create ./src/bot/.env file unsing "./src/bot/.env.sample"')
  process.exit(0)
}

require('dotenv').config({
  path: __dirname + '/.env',
})

import moduleAlias from 'module-alias'
import _debug from 'debug'
_debug('.:app')

console.log( __dirname + '/../core/simple')
moduleAlias.addAliases({
  'simple.swap.core'  : __dirname + '/../core/simple/src',
  'swap.core'         : __dirname + '/../core/',
  'swap.app'          : __dirname + '/../core/swap.app',
  'swap.auth'         : __dirname + '/../core/swap.auth',
  'swap.flows'        : __dirname + '/../core/swap.flows',
  'swap.orders'       : __dirname + '/../core/swap.orders',
  'swap.room'         : __dirname + '/../core/swap.room',
  'swap.swap'         : __dirname + '/../core/swap.swap',
  'swap.swaps'        : __dirname + '/../core/swap.swaps',
  //'helpers'           : __dirname + '/../core/simple/src/helpers',
})

exports = module.exports = require('./app')

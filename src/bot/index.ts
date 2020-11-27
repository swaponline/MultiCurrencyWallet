import * as fs from 'fs'

if (process.env.TEST_STARTUP === `true`) {
  console.log('>>>> TEST STARTUP')
  /* Test env */
  process.env.SERVER_ID='2234567890'
  process.env.ACCOUNT='2234567890'
  process.env.NETWORK='testnet'

  process.env.API_USER='user'
  process.env.API_PASS='password'

  process.env.SECRET_PHRASE='gospel total hundred major refuse when equal pilot goat soft recall abandon'

  process.env.WEB3_TESTNET_PROVIDER='https://rinkeby.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c'
  process.env.WEB3_MAINNET_PROVIDER='https://mainnet.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c'

  process.env.PORT='3000'
  process.env.IP='0.0.0.0'

  setTimeout(() => {
    console.log('>>>> TEST READY - SHUTDOWN')
    process.exit(0)
  }, 30*1000)
} else {
  if (!fs.existsSync(__dirname + '/.env')) {
    console.log('Please, create ./src/bot/.env file unsing "./src/bot/.env.sample"')
    process.exit(0)
  }

  require('dotenv').config({
    path: __dirname + '/.env',
  })
}


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

import * as app from './app'
export default app

import * as fs from 'fs'
import * as mnemonicUtils from 'common/utils/mnemonic'
import * as configStorage from './config/storage'
import { getNetworkType } from 'common/domain/network'
import { calcPairPrice, getPriceByPair } from './app/middlewares/prices'


// Mnemonic
if (process.argv.length === 14) {
  /* check - its may be run with seed */
  const mnemonic = process.argv.slice(2).join(` `)
  if (mnemonicUtils.mnemonicIsValid(mnemonic)) {
    configStorage.setMnemonic(mnemonic)
    console.log('>>> Use Mnemonic:', mnemonic)
  } else {
    console.log('>>> Your are pass not valid mnemonic')
    process.exit(0)
  }
}

// NETWORK
if (process.env.NETWORK !== undefined) {
  configStorage.setNetwork(getNetworkType(process.env.NETWORK))
}

// Use Json
if (process.env.USE_JSON === `true`) {
  configStorage.loadJson(configStorage.getNetwork())
  console.log('>>> Trade pairs: ', configStorage.getTradeTickers())
}

const rewriteEnvKeys = [
  `NETWORK`,
  `API_USER`,
  `API_PASS`,
  `SECRET_PHRASE`,
  `SPREAD`
]
const rewritedEnv = {}
rewriteEnvKeys.forEach((envKey) => {
  if (process.env[envKey] !== undefined) {
    rewritedEnv[envKey] = process.env[envKey]
  }
})

if (process.env.TEST_STARTUP === `true`) {
  console.log('>>>> TEST STARTUP')
  /* Test env */
  process.env.SERVER_ID='2234567890'
  process.env.ACCOUNT='2234567890'
  process.env.NETWORK = process.env.NETWORK || 'testnet'

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

// Rewrite vars from .env with values from command lineHeight
Object.keys(rewritedEnv).forEach((envKey) => {
  process.env[envKey] = rewritedEnv[envKey]
})

import _debug from 'debug'

_debug('.:app')

console.log('>>> Marketmaker starts...')

exports = module.exports = require('./app')
/*
import * as app from './app'

console.log(app)

export default app
*/


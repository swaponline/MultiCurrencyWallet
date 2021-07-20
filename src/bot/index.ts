import * as fs from 'fs'
import _debug from 'debug'

import * as mnemonicUtils from 'common/utils/mnemonic'
import * as configStorage from './config/storage'
import { getNetworkType } from 'common/domain/network'
import { FG_COLORS as COLORS, BG_COLORS, colorString } from 'common/utils/colorString'

import { feedbackToOwner } from './helpers/debugFeedBack'


const defaultConfig = {
  SERVER_ID: '2234567890',
  ACCOUNT: '2234567890',
  NETWORK: 'testnet',
  API_USER: 'user',
  API_PASS: '',
  PORT: '3000',
  IP: '0.0.0.0',
  MAX_PARALLEL_SWAPS: '3',
  WEB3_TESTNET_PROVIDER: 'https://rinkeby.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
  WEB3_MAINNET_PROVIDER: 'https://mainnet.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
}

console.log(colorString(`Loading...`, COLORS.GREEN))

if (process.env.TEST_STARTUP !== `true`) {
  if (!fs.existsSync(__dirname + '/.env')) {
    if (process.env.USE_JSON_CONFIG !== `true`) {
      console.log('Please, create ./src/bot/.env file unsing "./src/bot/.env.sample"')
      process.exit(0)
    }
  } else {
    require('dotenv').config({
      path: __dirname + '/.env',
    })
  }
}

const rewriteEnvKeys = [
  `NETWORK`,
  `PORT`,
  `API_USER`,
  `API_PASS`,
  `SECRET_PHRASE`,
  `USE_JSON`,
  `SPREAD`,
  `MAX_PARALLEL_SWAPS`,
  `TELEGRAM_CHATID`,
]

interface envKeys {
  NETWORK?: string,
  PORT?: string,
  API_USER?: string,
  API_PASS?: string,
  SECRET_PHRASE?: string,
  USE_JSON?: string,
  SPREAD?: string,
  MAX_PARALLEL_SWAPS?: string,
  TELEGRAM_CHATID?: string,
}

const rewritedEnv: envKeys = {}
// Mnemonic
// Extract env from args
if (process.argv.length >= 3) {
  /* check - its may be run with seed */
  process.argv.forEach((param) => {
    const [ name, value ] = param.split('=')
    if (rewriteEnvKeys.indexOf(name) !== -1) {
      rewritedEnv[name] = value
    }
  })
}

rewriteEnvKeys.forEach((envKey) => {
  if (process.env[envKey] !== undefined) {
    rewritedEnv[envKey] = process.env[envKey]
  }
})

if (rewritedEnv.SECRET_PHRASE) {
  const mnemonic = rewritedEnv.SECRET_PHRASE
  if (mnemonicUtils.mnemonicIsValid(mnemonic)) {
    configStorage.setMnemonic(mnemonic)
    console.log(
      colorString('>>> used SECRET_PHRASE', COLORS.GREEN)
    )
  } else {
    console.log(colorString('>>> Your are pass not valid mnemonic', COLORS.RED))
    process.exit(0)
  }
}

// NETWORK
if (rewritedEnv.NETWORK !== undefined || process.env.NETWORK !== undefined) {
  //@ts-ignore: strictNullChecks
  configStorage.setNetwork(getNetworkType(rewritedEnv.NETWORK))
}

// Use Json
if (process.env.USE_JSON_CONFIG === `true`) {
  configStorage.loadJson(configStorage.getNetwork())
  console.log(
    colorString('>>> Trade pairs: ', COLORS.GREEN),
    colorString(configStorage.getTradeTickers().toString(), COLORS.RED)
  )
}


if (process.env.TEST_STARTUP === `true`) {
  console.log(
    colorString('>>>> TEST STARTUP', COLORS.GREEN)
  )

  process.env.SECRET_PHRASE = 'gospel total hundred major refuse when equal pilot goat soft recall abandon'

  setTimeout(() => {
    console.log('>>>> TEST READY - SHUTDOWN')
    process.exit(0)
  }, 30*1000)
}


//load default env
Object.keys(defaultConfig).forEach((key) => {
  if (process.env[key] === undefined) {
    process.env[key] = defaultConfig[key]
  }
})


// Rewrite vars from .env with values from command line
Object.keys(rewritedEnv).forEach((envKey) => {
  process.env[envKey] = rewritedEnv[envKey]
})

if (process.env.MAX_PARALLEL_SWAPS) {
  console.log(
    colorString('>>> Maximum parallel swaps:', COLORS.GREEN),
    colorString(process.env.MAX_PARALLEL_SWAPS, COLORS.RED)
  )
}


feedbackToOwner(`Marketmaker started Network(${process.env.NETWORK})`)

_debug('.:app')

console.log(
  colorString('>>> Marketmaker starts...', COLORS.GREEN)
)

exports = module.exports = require('./app')
/*
import * as app from './app'

console.log(app)

export default app
*/

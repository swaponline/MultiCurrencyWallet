require('dotenv').config()
require('module-alias/register')


import { default as swapCore } from '../../'

const { constants } = swapCore
console.log('simple constants', swapCore.constants)

const setup = require('./setup')
const helpers = require('./helpers')
const config = require('./config')


module.exports = { setup, helpers, config, constants }

require('dotenv').config()
require('module-alias/register')


const { constants } = require('swap.core')

const setup = require('./setup')
const helpers = require('./helpers')
const config = require('./config')


module.exports = { setup, helpers, config, constants }

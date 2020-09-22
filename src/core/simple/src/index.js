require('dotenv').config()
require('babel-core/register')

require('app-module-path/register') // on windows

require('app-module-path').addPath(__dirname + '/../../src')
require('app-module-path').addPath(__dirname + '/../../lib')
require('app-module-path').addPath(__dirname + '/../node_modules/swap.core/lib')
require('app-module-path').addPath(__dirname + '/../swap.core/lib')
require('app-module-path').addPath(__dirname + '/../../swap.core/lib')


const { constants } = require('swap.core')

const setup = require('./setup')
const helpers = require('./helpers')
const config = require('./config')


module.exports = { setup, helpers, config, constants }

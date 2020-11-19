import dotenv from 'dotenv'
dotenv.config()

require('module-alias/register')


import { default as swapCore } from '../../'

const { constants } = swapCore


import setup from './setup'
import helpers from './helpers'
import config from './config'


export default { setup, helpers, config, constants }

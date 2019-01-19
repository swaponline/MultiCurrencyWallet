import eos from './eos'
import btc from './btc'
import eth from './eth'
import ethToken from './ethToken'
import bcash from './bcash'
import ltc from './ltc'
// import xlm from './xlm'
import web3 from './web3'
import links from './links'
import request from './request'
import constants from './constants'
import localStorage from './localStorage'
import api from './api'
import tips from './tips'
import * as utils from './utils'

// Methods
import ignoreProps from './ignoreProps'

// Getters
import getPageOffset from './getPageOffset'
import getScrollBarWidth from './getScrollBarWidth'

import { migrate } from './migrations/'

export default {
  eos,
  // xlm,
  bcash,
  btc,
  eth,
  ethToken,
  ltc,
}

export {
  eos,
  // xlm,
  bcash,
  tips,
  btc,
  eth,
  ethToken,
  ltc,
  web3,
  utils,
  links,
  request,
  constants,
  localStorage,
  api,
  migrate,
  // Methods
  ignoreProps,

  // Getters
  getPageOffset,
  getScrollBarWidth,
}

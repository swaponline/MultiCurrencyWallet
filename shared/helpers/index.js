import eos from './eos'
import btc from './btc'
import eth from './eth'
import ethToken from './ethToken'
import bcash from './bcash'
import ltc from './ltc'
// import xlm from './xlm'
import user from './user'
import web3 from './web3'
import links from './links'
import request from './request'
import constants from './constants'
import localStorage from './localStorage'
import swapsExplorer from './swapsExplorer'
import api from './api'
import tips from './tips'
import * as utils from './utils'
// Methods
import ignoreProps from './ignoreProps'
import handleGoTrade from './handleGoTrade'
// Getters
import getPageOffset from './getPageOffset'
import getScrollBarWidth from './getScrollBarWidth'
import paddingForSwapList from './paddingForSwapList'

import { migrate } from './migrations/'

export default {
  eos,
  // xlm,
  bcash,
  btc,
  eth,
  ethToken,
  ltc,
  handleGoTrade,
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
  user,
  web3,
  utils,
  links,
  request,
  constants,
  localStorage,
  swapsExplorer,
  api,
  migrate,
  // Methods
  ignoreProps,
  handleGoTrade,

  // Getters
  getPageOffset,
  getScrollBarWidth,
  paddingForSwapList,
}

import btc from './btc'
import eth from './eth'
import ethToken from './ethToken'
import bch from './bch'
import ltc from './ltc'
// import xlm from './xlm'
import user from './user'
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
import handleGoTrade from './handleGoTrade'
import firebase from './firebase'
// Getters
import getPageOffset from './getPageOffset'
import getScrollBarWidth from './getScrollBarWidth'
import paddingForSwapList from './paddingForSwapList'
import estimateFeeValue from './estimateFeeValue'
import transactions from './transactions'

import { migrate } from './migrations/'

import getUnixTimeStamp from './getUnixTimeStamp'
import { cacheStorageGet, cacheStorageSet } from './cache'

import apiLooper from './apiLooper'


export default {
  // xlm,
  bch,
  btc,
  eth,
  ethToken,
  ltc,
  handleGoTrade,
  estimateFeeValue,
}

export {
  // xlm,
  bch,
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
  api,
  migrate,
  // Methods
  ignoreProps,
  handleGoTrade,
  firebase,

  // Getters
  getPageOffset,
  getScrollBarWidth,
  paddingForSwapList,
  transactions,

  getUnixTimeStamp,
  cacheStorageGet,
  cacheStorageSet,

  apiLooper,
}

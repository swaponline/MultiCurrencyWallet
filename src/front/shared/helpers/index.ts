import btc from './btc'
import ghost from './ghost'
import next from './next'
import eth from './eth'
import bnb from './bnb'
import matic from './matic'
import arbeth from './arbeth'
import aureth from './aureth'
import phi from './phi'
import xdai from './xdai'
import ftm from './ftm'
import avax from './avax'
import movr from './movr'
import one from './one'
import ame from './ame'
import ethToken from './ethToken'
import * as user from './user'
import web3 from './web3'
import links from './links'
import getCurrencyKey from './getCurrencyKey'
import constants from './constants'
import localStorage from './localStorage'
import api from './api'
import * as utils from './utils'
import seo from './seo'
// Methods
import ignoreProps from './ignoreProps'
import handleGoTrade from './handleGoTrade'
// Getters
import externalConfig from './externalConfig'
import feedback from './feedback'
import getPageOffset from './getPageOffset'
import transactions from './transactions'
import quickswap from './quickswap'
import { migrate } from './migrations'

import {
  cacheStorageGet,
  cacheStorageSet,
  cacheStorageClear,
  cacheStorageClearPart,
} from './cache'
import lsDataCache from './lsDataCache'

import apiLooper from './apiLooper'
import wpLogoutModal from './wpLogoutModal'

import metamask from './metamask'

import * as routing from './routing'

import adminFee from './adminFee'

import swaps from './swaps'

import stats from './stats.swaponline'

import { getPairFees } from './getPairFees'

export default {
  btc,
  eth,
  bnb,
  matic,
  arbeth,
  aureth,
  phi,
  xdai,
  ftm,
  avax,
  movr,
  one,
  ame,
  ghost,
  next,
  ethToken,
  getCurrencyKey,
  handleGoTrade,
  transactions,
  localStorage,
}

export {
  seo,
  btc,
  eth,
  bnb,
  matic,
  arbeth,
  aureth,
  xdai,
  ftm,
  avax,
  movr,
  one,
  ame,
  ghost,
  next,
  ethToken,
  user,
  web3,
  utils,
  links,
  getCurrencyKey,
  lsDataCache,
  transactions,
  constants,
  localStorage,
  api,
  migrate,
  // Methods
  ignoreProps,
  handleGoTrade,

  // Getters
  getPageOffset,
  externalConfig,

  feedback,
  cacheStorageGet,
  cacheStorageSet,
  cacheStorageClear,
  cacheStorageClearPart,

  apiLooper,

  metamask,

  routing,

  adminFee,

  swaps,

  stats,

  wpLogoutModal,

  getPairFees,
  quickswap,
}
export { getItezUrl } from './getItezUrl'

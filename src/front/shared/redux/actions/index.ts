import config from 'app-config'

import * as types from './types'

import modals from './modals'
import loader from './loader'
import notifications from './notifications'

import user from './user'
import history from './history'
import feed from './feed'
import core from './core'
import ui from './ui'
import filter from './filter'

import btc from './btc'
import ghost from './ghost'
import next from './next'
import btcmultisig from './btcmultisig'
import EthLikeAction from './ethLikeAction'
import Erc20LikeAction from './erc20LikeAction'

import api from './api'
import pairs from './pairs'
import referral from './referral'
import analytics from './analytics'

import pubsubRoom from './pubsubRoom'

import invoices from './invoices'
import comments from './comments'

import backupManager from './backupManager'

import multisigTx from './multisigTx'

const tokens = {}

Object.keys(config.erc20)
  .forEach(key => {
    tokens[key] = Erc20LikeAction.token
  })

export default {
  ...tokens,
  types,
  filter,
  modals,
  loader,
  notifications,
  user,
  history,
  core,
  ui,

  btc,
  btcmultisig,
  eth: EthLikeAction.ETH,
  bnb: EthLikeAction.BNB,
  token: Erc20LikeAction.token,
  ghost,
  next,

  feed,
  analytics,
  referral,
  pubsubRoom,
  api,
  pairs,
  invoices,
  comments,

  // Local storage backups manager
  backupManager,

  multisigTx,
}

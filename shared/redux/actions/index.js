import config from 'app-config'

import modals from './modals'
import loader from './loader'
import notifications from './notifications'
import firebase from './firebase'

import user from './user'
import history from './history'
import feed from './feed'
import core from './core'
import filter from './filter'

import btc from './btc'
import btcmultisig from './btcmultisig'
import bch from './bch'
import eth from './eth'
import token from './token'
import nimiq from './nimiq'
// import qtum from './qtum'
// import xlm from './xlm'
// import usdt from './usdt'

import api from './api'
import pairs from './pairs'
import referral from './referral'
import analytics from './analytics'

import ipfs from './ipfs'

import invoices from './invoices'
import comments from './comments'

import backupManager from './backupManager'


const tokens = {}

Object.keys(config.erc20)
  .forEach(key => {
    tokens[key] = token
  })

export default {
  ...tokens,
  filter,
  modals,
  loader,
  notifications,
  firebase,
  user,
  history,
  core,

  bch,
  btc,
  btcmultisig,
  eth,
  nimiq,
  // qtum,
  // xlm,
  // usdt,

  token,
  feed,
  analytics,
  referral,
  ipfs,
  api,
  pairs,
  invoices,
  comments,

  // Local storage backups manager
  backupManager,
}

import config from 'app-config'

import modals from './modals'
import loader from './loader'
import notifications from './notifications'
import firebase from './firebase'

import user from './user'
import history from './history'
import feed from './feed'
import core from './core'
import ui from './ui'
import filter from './filter'

import btc from './btc'
import btcmultisig from './btcmultisig'
import sum from './sum'
import eth from './eth'
import token from './token'

import api from './api'
import pairs from './pairs'
import referral from './referral'
import analytics from './analytics'

import ipfs from './ipfs'

import invoices from './invoices'
import comments from './comments'

import backupManager from './backupManager'

import multisigTx from './multisigTx'


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
  ui,

  btc,
  btcmultisig,
  sum,
  eth,

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

  multisigTx,
}

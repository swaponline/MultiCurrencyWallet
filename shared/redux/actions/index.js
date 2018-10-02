import config from 'app-config'

import modals from './modals'
import loader from './loader'
import notifications from './notifications'

import user from './user'
import feed from './feed'
import core from './core'
import filter from './filter'

import btc from './btc'
import bch from './bch'
import ltc from './ltc'
import eth from './eth'
import eos from './eos'
import token from './token'
import nimiq from './nimiq'
import api from './api'

import referral from './referral'
import analytics from './analytics'

import ipfs from './ipfs'


import usdt from './usdt'


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
  user,
  core,
  ltc,
  bch,
  btc,
  usdt,
  eth,
  token,
  nimiq,
  eos,
  feed,
  analytics,
  referral,
  ipfs,
  api,
}

import { constants } from 'swap.app'

import SwapAuth from 'swap.auth'
import SwapRoom from 'swap.room'
import SwapOrders from 'swap.orders'

import { EthSwap, EthTokenSwap, BtcSwap, /*UsdtSwap,*/ } from 'swap.swaps'
import {
  ETH2BTC, BTC2ETH,
  ETHTOKEN2BTC, BTC2ETHTOKEN,
  /*USDT2ETHTOKEN, ETHTOKEN2USDT*/ } from 'swap.flows'

import eth from '../instances/ethereum'
import btc from '../instances/bitcoin'

import common from './common'

import tokenSwap from './tokenSwap'

import setupLocalStorage from './setupLocalStorage'
import { LocalStorage } from 'node-localstorage'
import sessionStorage from 'node-sessionstorage'


const ROOT_DIR = process.env.ROOT_DIR || '.'

export default (config) => ({ account, mnemonic, contracts: { ETH, TOKEN }, ...custom }) => {
  config = {
    ...common,
    ...config,
    ...custom,

    swapAuth: {
      //@ts-ignore
      ...common.swapAuth,
      ...config.swapAuth,
      ...custom.swapAuth,
    },

    swapRoom: {
      ...common.swapRoom,
      ...config.swapRoom,
      ...custom.swapRoom,
    },
  }

  console.log('setup .storage')
  setupLocalStorage(`${ROOT_DIR}/.storage/`)
  console.log('make dir with session', config.storageDir)
  setupLocalStorage(config.storageDir)
  
  const storage = new LocalStorage(config.storageDir)

  const web3 = eth[config.network]().core
  const bitcoin = btc[config.network]().core

  const tokens = (config.ERC20TOKENS || [])
    .map(_token => ({ network: config.network, ..._token }))
    .filter(_token => _token.network === config.network)

  return {
    network: config.network,
    constants,
    env: {
      web3,
      bitcoin,
      // bcash,
      storage,
      sessionStorage,
      ...config.env,
    },
    services: [
      new SwapAuth({
        eth: account,
        btc: null,
        ...config.swapAuth
      }, mnemonic),
      new SwapRoom(config.swapRoom),
      new SwapOrders(),
    ],

    swaps: [
      new EthSwap(config.ethSwap(ETH)),
      new BtcSwap(config.btcSwap()),
      /*config.network === 'mainnet'
        ? new UsdtSwap(config.usdtSwap())
        : null,*/

      new EthTokenSwap(config.noxonTokenSwap(TOKEN)),
      new EthTokenSwap(config.swapTokenSwap(TOKEN)),
      ...(
        (config.swaps || [])
      ),
      ...(
        //@ts-ignore
        tokens.map(_token => new EthTokenSwap(tokenSwap(_token)()))
      )
    ]
      .filter(a => !!a),

    flows: [
      ETH2BTC,
      BTC2ETH,
      ETHTOKEN2BTC(constants.COINS.noxon),
      BTC2ETHTOKEN(constants.COINS.noxon),
      ETHTOKEN2BTC(constants.COINS.swap),
      BTC2ETHTOKEN(constants.COINS.swap),
      ...(config.flows || []),
      ...((
        [].concat.apply([],
          tokens.map(({ name }) => ([
            ETHTOKEN2BTC(name),
            BTC2ETHTOKEN(name),
          ]))
        )
      ) || []
      )
    ],
  }
}

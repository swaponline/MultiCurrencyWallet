import { constants } from 'swap.app'

import SwapAuth from 'swap.auth'
import SwapRoom from 'swap.room'
import SwapOrders from 'swap.orders'

import { default as nextUtils } from 'common/utils/coin/next'
import { default as btcUtils } from 'common/utils/coin/btc'

import {
  EthSwap,
  EthTokenSwap,
  BtcSwap,
  NextSwap
} from 'swap.swaps'

import {
  TurboMaker, TurboTaker,
  ETH2BTC, BTC2ETH,
  ETHTOKEN2BTC, BTC2ETHTOKEN,
  ETH2NEXT, NEXT2ETH,
  ETHTOKEN2NEXT, NEXT2ETHTOKEN
} from 'swap.flows'

import * as eth from '../instances/ethereum'

import { common } from './common'
import { default as tokenSwap } from './tokenSwap'

import setupLocalStorage from './setupLocalStorage'
import { LocalStorage } from 'node-localstorage'
import sessionStorage from 'node-sessionstorage'


const ROOT_DIR = process.env.ROOT_DIR || '.'

const getConfig = (config) => ({ account, mnemonic, contracts: { ETH, TOKEN }, ...custom }) => {
  config = {
    ...common,
    ...config,
    ...custom,

    swapAuth: {
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

  setupLocalStorage(`${ROOT_DIR}/.storage/`)
  setupLocalStorage(config.storageDir)
  
  const storage = new LocalStorage(config.storageDir)
  const NETWORK = config.network.toUpperCase()

  const web3 = eth[config.network]().core
  const bitcoin = btcUtils.getCore()
  const next = nextUtils.getCore()

  const tokens = (config.ERC20TOKENS || [])
    .map(_token => ({ network: config.network, ..._token }))
    .filter(_token => _token.network === config.network)

  return {
    network: config.network,
    constants,
    env: {
      web3,
      bitcoin,
      next,
      storage,
      sessionStorage,
      coininfo: {
        next: {
          main: nextUtils.networks.mainnet,
          test: nextUtils.networks.mainnet,
        },
      },
      ...config.env,
    },
    services: [
      new SwapAuth({
        eth: account,
        btc: null,
        next: null,
        ...config.swapAuth
      }, mnemonic),
      new SwapRoom(config.swapRoom),
      new SwapOrders(),
    ],

    swaps: [
      new EthSwap(config.ethSwap(ETH)),
      new BtcSwap({
        fetchBalance: (address) => btcUtils.fetchBalance({
          address,
          NETWORK,
        }),
        fetchUnspents: (address) => btcUtils.fetchUnspents({
          address,
          NETWORK,
        }),
        broadcastTx: (txRaw) => btcUtils.broadcastTx({
          txRaw,
          NETWORK,
        }),
        fetchTxInfo: (hash) => btcUtils.fetchTxInfo({
          hash,
          NETWORK,
        }),
        estimateFeeValue: (options) => btcUtils.estimateFeeValue({
          ...options,
          NETWORK,
        }),
        checkWithdraw: (scriptAddress) => btcUtils.checkWithdraw({
          scriptAddress,
          NETWORK,
        }),
        fetchTxInputScript: (options) => btcUtils.fetchTxInputScript({
          ...options,
          NETWORK,
        }),
      }),
      new NextSwap({
        fetchBalance: (address) => nextUtils.fetchBalance({
          address,
          NETWORK,
        }),
        fetchUnspents: (address) => nextUtils.fetchUnspents({
          address,
          NETWORK,
        }),
        broadcastTx: (txRaw) => nextUtils.broadcastTx({
          txRaw,
          NETWORK,
        }),
        fetchTxInfo: (txid) => nextUtils.fetchTxInfo({
          txid,
          NETWORK,
        }),
        estimateFeeValue: (options) => nextUtils.estimateFeeValue({
          ...options,
          NETWORK,
        }),
        checkWithdraw: (scriptAddress) => nextUtils.checkWithdraw({
          scriptAddress,
          NETWORK,
        }),
        fetchTxInputScript: (options) => nextUtils.fetchTxInputScript({
          ...options,
          NETWORK,
        }),
      }),
      new EthTokenSwap(config.swapTokenSwap(TOKEN)),
      ...(
        (config.swaps || [])
      ),
      ...(
        tokens.map(_token => new EthTokenSwap(tokenSwap(_token)))
      )
    ]
      .filter(a => !!a),

    flows: [
      TurboMaker, TurboTaker,

      ETH2BTC,
      BTC2ETH,

      ETH2NEXT, NEXT2ETH,

      ...(config.flows || []),
      ...((
        [].concat.apply([],
          tokens.map(({ name }) => ([
            ETHTOKEN2BTC(name),
            BTC2ETHTOKEN(name),
            ETHTOKEN2NEXT(name),
            NEXT2ETHTOKEN(name)
          ]))
        )
      ) || []
      )
    ],
  }
}


export { getConfig }
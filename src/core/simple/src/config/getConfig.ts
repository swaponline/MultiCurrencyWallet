import { constants } from 'swap.app'

import SwapAuth from 'swap.auth'
import SwapRoom from 'swap.room'
import SwapOrders from 'swap.orders'

import { default as nextUtils } from '../../../../common/utils/coin/next'
import { default as btcUtils } from '../../../../common/utils/coin/btc'

import {
  EthSwap,
  EthTokenSwap,
  BtcSwap,
  NextSwap
} from 'swap.swaps'

import {
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
      // bcash,
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
        fetchTxInfo: (txid) => btcUtils.fetchTxInfo({
          txid,
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
      }),
      /*config.network === 'mainnet'
        ? new UsdtSwap(config.usdtSwap())
        : null,*/
      
      // flows for swap
      /*
      nextSwap: () => ({
        
      })*/
      new EthTokenSwap(config.noxonTokenSwap(TOKEN)),
      new EthTokenSwap(config.swapTokenSwap(TOKEN)),
      ...(
        (config.swaps || [])
      ),
      ...(
        //@ts-ignore
        tokens.map(_token => new EthTokenSwap(tokenSwap(_token)))
      )
    ]
      .filter(a => !!a),

    flows: [
      ETH2BTC,
      BTC2ETH,

      ETH2NEXT, NEXT2ETH,

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
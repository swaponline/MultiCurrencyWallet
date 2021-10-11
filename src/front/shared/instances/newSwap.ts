import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'
import * as bitcoin from 'bitcoinjs-lib'
import * as ghost from 'bitcoinjs-lib'
import * as next from 'bitcoinjs-lib'

import abi from 'human-standard-token-abi'
import ethLikeHelper from 'common/helpers/ethLikeHelper'
import EVM_CONTRACTS_ABI from 'common/helpers/constants/EVM_CONTRACTS_ABI'
import erc20Like from 'common/erc20Like'

import config from 'helpers/externalConfig'

import helpers, { constants, utils } from 'helpers'
import actions from 'redux/actions'
import { getActiveEvmActions } from 'redux/actions'

import SwapApp from 'swap.app'
import SwapAuth from 'swap.auth'
import SwapRoom from 'swap.room'
import SwapOrders from 'swap.orders'
import {
  TurboMaker,
  TurboTaker,

  ETH2BTC,
  BTC2ETH,
  ETHTOKEN2BTC,
  BTC2ETHTOKEN,

  GHOST2ETH,
  ETH2GHOST,
  ETHTOKEN2GHOST,
  GHOST2ETHTOKEN,
  //GHOST2BTC,
  //BTC2GHOST,

  NEXT2ETH,
  ETH2NEXT,
  ETHTOKEN2NEXT,
  NEXT2ETHTOKEN,
  //NEXT2BTC,
  //BTC2NEXT,


  BNB2BTC,
  BTC2BNB,
  BSCTOKEN2BTC,
  BTC2BSCTOKEN,

  MATIC2BTC,
  BTC2MATIC,
  MATICTOKEN2BTC,
  BTC2MATICTOKEN,

  ARBITRUM2BTC,
  BTC2ARBITRUM,  
} from 'swap.flows'
import {
  BtcSwap,
  EthSwap,
  BnbSwap,
  MaticSwap,
  ArbitrumSwap,
  GhostSwap,
  NextSwap,

  EthTokenSwap,
  BscTokenSwap,
  MaticTokenSwap,

} from 'swap.swaps'

import metamask from 'helpers/metamask'

import { default as bitcoinUtils } from 'common/utils/coin/btc'
import { default as nextUtils } from 'common/utils/coin/next'

const repo = utils.createRepo()
utils.exitListener()

let _inited = false

const onInit = (cb) => {
  const _wait = () => {
    if (_inited) {
      cb()
    } else {
      setTimeout(_wait, 100)
    }
  }
  _wait()
}

const returnSwapClassByName = (name: string) => {
  switch (name) {
    case 'eth':
      return EthSwap
    case 'bnb':
      return BnbSwap
    case 'matic':
      return MaticSwap
    case 'arbeth':
      return ArbitrumSwap
  }
}

const returnSwapInstance = (Swap, currencyAction) => {
  return new Swap({
    address: config.swapContract[currencyAction.tickerKey],
    abi: EVM_CONTRACTS_ABI.NATIVE_COIN_SWAP,
    fetchBalance: (address) => currencyAction.fetchBalance(address),
    estimateGasPrice: () => ethLikeHelper[currencyAction.tickerKey].estimateGasPrice(),
    sendTransaction: ({ to, amount }) => currencyAction.send({ to, amount }),
  })
}

const returnTokenSwapClassByStandard = (standard: string) => {
  switch (standard) {
    case 'erc20':
      return EthTokenSwap
    case 'bep20':
      return BscTokenSwap
    case 'erc20matic':
      return MaticTokenSwap
  }
}

const returnTokenSwapInstances = (Swap, standard) => {
  if (!config[standard]) return []

  return Object.keys(config[standard]).map(
    (key) =>
      new Swap({
        name: key,
        tokenAbi: abi,
        address: config.swapContract[standard],
        decimals: config[standard][key].decimals,
        tokenAddress: config[standard][key].address,
        fetchBalance: (address) =>
          actions[standard].fetchBalance(
            address,
            config[standard][key].address,
            config[standard][key].decimals
          ),
        estimateGasPrice: () => erc20Like[standard].estimateGasPrice(),
        abi: EVM_CONTRACTS_ABI.TOKEN_SWAP,
      })
  )
}

const createSwapApp = async () => {
  await metamask.web3connect.onInit(async () => {
    const NETWORK = process.env.MAINNET ? `MAINNET` : `TESTNET`

    const evmEnv = {}
    const swapAuthEvmPrivateKeys = {}
    const evmSwaps: any[] = []
    const evmActions = getActiveEvmActions()

    if (evmActions.length) {
      evmActions.forEach((action) => {
        if (config?.opts?.blockchainSwapEnabled[action.tickerKey]) {
          const capitalizedName =
            action.tickerKey.charAt(0).toUpperCase() + action.tickerKey.slice(1)

          if (action.tickerKey === 'eth') {
            evmEnv['web3'] = action.getWeb3()
            evmEnv['getWeb3'] = action.getWeb3
          } else {
            evmEnv[`web3${capitalizedName}`] = action.getWeb3()
            evmEnv[`getWeb3${capitalizedName}`] = action.getWeb3
          }

          // use eth private key for all EVM compatible networks
          swapAuthEvmPrivateKeys[action.tickerKey] = localStorage.getItem(
            constants.privateKeyNames.eth
          )

          const Swap = returnSwapClassByName(action.tickerKey)
          const standardData = Object.values(constants.tokenStandards).find((standardData) => {
            return action.tickerKey === standardData.currency
          })

          if (Swap) {
            evmSwaps.push(returnSwapInstance(Swap, action))
          }

          if (standardData) {
            const { standard } = standardData
            const TokenSwap = returnTokenSwapClassByStandard(standard)

            if (TokenSwap) {
              evmSwaps.push(...returnTokenSwapInstances(TokenSwap, standard))
            }
          }
        }
      })
    }

    SwapApp.setup({
      network: NETWORK.toLowerCase(),
      env: {
        ...evmEnv,
        bitcoin,
        ghost,
        next,
        coininfo: {
          ghost: {
            main: helpers.ghost.networks.mainnet,
            test: helpers.ghost.networks.testnet,
          },
          next: {
            main: helpers.next.networks.mainnet,
            test: helpers.next.networks.mainnet,
          },
        },
        storage: window.localStorage,
        sessionStorage: window.sessionStorage,
        metamask,
        isBinance: !!config.binance,
        isTest: !!config.isTest,
      },

      // White list (Список адресов btc довереных продавцов)
      // whitelistBtc: [],

      services: [
        new SwapAuth({
          // TODO need init swapApp only after private keys created!!!!!!!!!!!!!!!!!!!
          ...swapAuthEvmPrivateKeys,
          btc: localStorage.getItem(constants.privateKeyNames.btc),
          ghost: localStorage.getItem(constants.privateKeyNames.ghost),
          next: localStorage.getItem(constants.privateKeyNames.next),
        }),
        new SwapRoom({
          repo,
          config: {
            Addresses: {
              Swarm: [
                config.pubsubRoom.swarm,
              ],
            },
          },
        }),
        new SwapOrders(),
      ],
      swaps: [
        ...evmSwaps,

        new BtcSwap({
          fetchBalance: (address) => bitcoinUtils.fetchBalance({
            address,
            NETWORK,
          }),
          fetchUnspents: (address) => bitcoinUtils.fetchUnspents({
            address,
            NETWORK,
          }),
          broadcastTx: (txRaw) => bitcoinUtils.broadcastTx({
            txRaw,
            NETWORK,
          }),
          fetchTxInfo: (hash) => bitcoinUtils.fetchTxInfo({
            hash,
            NETWORK,
          }),
          checkWithdraw: (scriptAddress) => bitcoinUtils.checkWithdraw({
            scriptAddress,
            NETWORK,
          }),
          estimateFeeValue: (options) => bitcoinUtils.estimateFeeValue({
            ...options,
            NETWORK,
          }),
          fetchTxInputScript: (options) => bitcoinUtils.fetchTxInputScript({
            ...options,
            NETWORK,
          }),
          sendTransaction: ({ to, amount }) => actions.btc.sendTransaction({ to, amount }),
        }),
        new GhostSwap({
          fetchBalance: (address) => actions.ghost.fetchBalance(address),
          fetchUnspents: (scriptAddress) => actions.ghost.fetchUnspents(scriptAddress),
          broadcastTx: (txRaw) => actions.ghost.broadcastTx(txRaw),
          fetchTxInfo: (txid) => actions.ghost.fetchTxInfo(txid),
          checkWithdraw: (scriptAddress) => actions.ghost.checkWithdraw(scriptAddress),
          estimateFeeValue: ({ inSatoshis, speed, address, txSize }) => helpers.ghost.estimateFeeValue({ inSatoshis, speed, address, txSize }),
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
          fetchTxInfo: (hash) => nextUtils.fetchTxInfo({
            hash,
            NETWORK,
          }),
          checkWithdraw: (scriptAddress) => nextUtils.checkWithdraw({
            scriptAddress,
            NETWORK,
          }),
          estimateFeeValue: (options) => nextUtils.estimateFeeValue({
            ...options,
            NETWORK,
          }),
          fetchTxInputScript: (options) => nextUtils.fetchTxInputScript({
            ...options,
            NETWORK,
          }),
        }),
      ],
      flows: [
        TurboMaker,
        TurboTaker,

        ETH2BTC,
        BTC2ETH,

        BNB2BTC,
        BTC2BNB,

        ...((config?.opts?.blockchainSwapEnabled?.matic) ? [
          MATIC2BTC,
          BTC2MATIC,
        ] : []),

        ARBITRUM2BTC,
        BTC2ARBITRUM,

        // GHOST2BTC,
        // BTC2GHOST,

        GHOST2ETH,
        ETH2GHOST,

        //NEXT2BTC,
        //BTC2NEXT,

        NEXT2ETH,
        ETH2NEXT,

        ...(Object.keys(config.bep20))
          .map(key => BSCTOKEN2BTC(key)),
        ...(Object.keys(config.bep20))
          .map(key => BTC2BSCTOKEN(key)),

          ...(Object.keys(config.erc20matic))
          .map(key => MATICTOKEN2BTC(key)),
        ...(Object.keys(config.erc20matic))
          .map(key => BTC2MATICTOKEN(key)),

        ...(Object.keys(config.erc20))
          .map(key => ETHTOKEN2BTC(key)),

        ...(Object.keys(config.erc20))
          .map(key => BTC2ETHTOKEN(key)),

        ...(Object.keys(config.erc20))
          .map(key => ETHTOKEN2GHOST(key)),

        ...(Object.keys(config.erc20))
          .map(key => GHOST2ETHTOKEN(key)),

        ...(Object.keys(config.erc20))
          .map(key => ETHTOKEN2NEXT(key)),

        ...(Object.keys(config.erc20))
          .map(key => NEXT2ETHTOKEN(key)),

      ],
    }, true)


    window.SwapApp = SwapApp.shared()
    _inited = true
  })
}

export {
  createSwapApp,
  onInit,
}
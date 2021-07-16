import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'
import * as bitcoin from 'bitcoinjs-lib'
import * as ghost from 'bitcoinjs-lib'
import * as next from 'bitcoinjs-lib'

import abi from 'human-standard-token-abi'
import ethLikeHelper from 'common/helpers/ethLikeHelper'
import EVM_CONTRACTS_ABI from 'common/helpers/constants/EVM_CONTRACTS_ABI'
import erc20Like from 'common/erc20Like'

import config, { initExternalConfig } from 'helpers/externalConfig'

import helpers, { constants as privateKeys, utils } from 'helpers'
import actions from 'redux/actions'

import SwapApp, { constants } from 'swap.app'
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

import { default as bitcoinUtils } from '../../../common/utils/coin/btc'
import { default as nextUtils } from '../../../common/utils/coin/next'


initExternalConfig()

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

const createSwapApp = async () => {
  await metamask.web3connect.onInit(async () => {
    const web3 = actions.eth.getWeb3()
    const NETWORK = process.env.MAINNET ? `MAINNET` : `TESTNET`

    SwapApp.setup({
      network: process.env.MAINNET ? 'mainnet' : 'testnet',

      env: {
        web3,
        getWeb3: actions.eth.getWeb3,
        web3bnb: actions.bnb.getWeb3(),
        getWeb3Bnb: actions.bnb.getWeb3,
        web3Matic: actions.matic.getWeb3(),
        getWeb3Matic: actions.matic.getWeb3,
        web3Arbitrum: actions.arbeth.getWeb3(),
        getWeb3Arbitrum: actions.arbeth.getWeb3,
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
          eth: localStorage.getItem(privateKeys.privateKeyNames.eth),
          // for evm compatible blockchains use eth private key
          bnb: localStorage.getItem(privateKeys.privateKeyNames.eth),
          matic: localStorage.getItem(privateKeys.privateKeyNames.eth),
          arbeth: localStorage.getItem(privateKeys.privateKeyNames.eth),
          btc: localStorage.getItem(privateKeys.privateKeyNames.btc),
          ghost: localStorage.getItem(privateKeys.privateKeyNames.ghost),
          next: localStorage.getItem(privateKeys.privateKeyNames.next),
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
        new EthSwap({
          address: config.swapContract.eth,
          abi: EVM_CONTRACTS_ABI.NATIVE_COIN_SWAP,
          fetchBalance: (address) => actions.eth.fetchBalance(address),
          estimateGasPrice: () => ethLikeHelper.eth.estimateGasPrice(),
          sendTransaction: ({ to, amount }) => actions.eth.send({ to, amount }),
        }),
        new BnbSwap({
          address: config.swapContract.bnb,
          abi: EVM_CONTRACTS_ABI.NATIVE_COIN_SWAP,
          fetchBalance: (address) => actions.bnb.fetchBalance(address),
          estimateGasPrice: () => ethLikeHelper.bnb.estimateGasPrice(),
          sendTransaction: ({ to, amount }) => actions.bnb.send({ to, amount }),
        }),
        ...((config?.opts?.blockchainSwapEnabled?.matic) ? [
          new MaticSwap({
            address: config.swapContract.matic,
            abi: EVM_CONTRACTS_ABI.NATIVE_COIN_SWAP,
            fetchBalance: (address) => actions.matic.fetchBalance(address),
            estimateGasPrice: () => ethLikeHelper.matic.estimateGasPrice(),
            sendTransaction: ({ to, amount }) => actions.matic.send({ to, amount }),
          })
        ] : []),
        ...((config?.opts?.blockchainSwapEnabled?.arbeth) ? [
          new ArbitrumSwap({
            address: config.swapContract.arbitrum,
            abi: EVM_CONTRACTS_ABI.NATIVE_COIN_SWAP,
            fetchBalance: (address) => actions.arbeth.fetchBalance(address),
            estimateGasPrice: () => ethLikeHelper.arbeth.estimateGasPrice(),
            sendTransaction: ({ to, amount }) => actions.arbeth.send({ to, amount }),
          })
        ] : []),
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
        // Ether
        ...(Object.keys(config.erc20)
          .map(key =>
            new EthTokenSwap({
              name: key,
              tokenAbi: abi,
              address: config.swapContract.erc20,
              //@ts-ignore
              decimals: config.erc20[key].decimals,
              tokenAddress: config.erc20[key].address,
              fetchBalance: (address) => actions.erc20.fetchBalance(address, config.erc20[key].address, config.erc20[key].decimals),
              //@ts-ignore
              estimateGasPrice: ({ speed } = {}) => erc20Like.erc20.estimateGasPrice({ speed }),
              abi: EVM_CONTRACTS_ABI.TOKEN_SWAP,
            })
          )),
        // Binance
        ...(Object.keys(config.bep20)
          .map(key =>
            new BscTokenSwap({
              name: key,
              tokenAbi: abi,
              address: config.swapContract.bep20,
              //@ts-ignore
              decimals: config.bep20[key].decimals,
              tokenAddress: config.bep20[key].address,
              fetchBalance: (address) => actions.bep20.fetchBalance(address, config.bep20[key].address, config.bep20[key].decimals),
              //@ts-ignore
              estimateGasPrice: ({ speed } = {}) => erc20Like.bep20.estimateGasPrice({ speed }),
              abi: EVM_CONTRACTS_ABI.TOKEN_SWAP,
            })
          )),
        // Matic
        ...(Object.keys(config.erc20matic)
        .map(key =>
          new MaticTokenSwap({
            name: key,
            tokenAbi: abi,
            address: config.swapContract.erc20matic,
            //@ts-ignore
            decimals: config.erc20matic[key].decimals,
            tokenAddress: config.erc20matic[key].address,
            fetchBalance: (address) => actions.erc20matic.fetchBalance(address, config.erc20matic[key].address, config.erc20matic[key].decimals),
            //@ts-ignore
            estimateGasPrice: ({ speed } = {}) => erc20Like.erc20matic.estimateGasPrice({ speed }),
            abi: EVM_CONTRACTS_ABI.TOKEN_SWAP,
          })
        )),
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
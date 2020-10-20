/* eslint-disable import/no-mutable-exports,max-len */
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'
import { getWeb3 } from 'helpers/web3'
import * as bitcoin from 'bitcoinjs-lib'
import * as ghost from 'bitcoinjs-lib'
import * as next from 'bitcoinjs-lib'

import abi from 'human-standard-token-abi'

import config, { initExternalConfig } from 'helpers/externalConfig'

import helpers, { constants as privateKeys, utils } from 'helpers'
import actions from 'redux/actions'

import SwapApp, { constants } from 'swap.app'
import SwapAuth from 'swap.auth'
import SwapRoom from 'swap.room'
import SwapOrders from 'swap.orders'
import {
  ETH2BTC,
  BTC2ETH,
  ETHTOKEN2BTC,
  BTC2ETHTOKEN,

  GHOST2ETH,
  ETH2GHOST,
  ETHTOKEN2GHOST,
  GHOST2ETHTOKEN,
  GHOST2BTC,
  BTC2GHOST,

  NEXT2ETH,
  ETH2NEXT,
  ETHTOKEN2NEXT,
  NEXT2ETHTOKEN,
  NEXT2BTC,
  BTC2NEXT,
} from 'swap.flows'
import { EthSwap, EthTokenSwap, BtcSwap, GhostSwap, NextSwap } from 'swap.swaps'

import metamask from 'helpers/metamask'


initExternalConfig()

const repo = utils.createRepo()
utils.exitListener()


const createSwapApp = async () => {
  const web3 = (metamask.isEnabled() && metamask.isConnected())
    ? await metamask.getWeb3()
    : await getWeb3()

  SwapApp.setup({
    network: process.env.MAINNET ? 'mainnet' : 'testnet',

    env: {
      web3,
      getWeb3,
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
      metamask: (metamask.isEnabled() && metamask.isConnected())
        ? metamask
        : false,
    },

    // White list (Список адресов btc довереных продавцов)
    // whitelistBtc: [],

    services: [
      new SwapAuth({
        // TODO need init swapApp only after private keys created!!!!!!!!!!!!!!!!!!!
        eth: localStorage.getItem(privateKeys.privateKeyNames.eth),
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
        /* eslint-disable */
        abi: [{ "constant": false, "inputs": [{ "name": "_secret", "type": "bytes32" }, { "name": "_ownerAddress", "type": "address" }], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_participantAddress", "type": "address" }], "name": "getSecret", "outputs": [{ "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "participantSigns", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_secret", "type": "bytes32" }, { "name": "participantAddress", "type": "address" }], "name": "withdrawNoMoney", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_secretHash", "type": "bytes20" }, { "name": "_participantAddress", "type": "address" }, { "name": "_targetWallet", "type": "address" }], "name": "createSwapTarget", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "swaps", "outputs": [{ "name": "targetWallet", "type": "address" }, { "name": "secret", "type": "bytes32" }, { "name": "secretHash", "type": "bytes20" }, { "name": "createdAt", "type": "uint256" }, { "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_ownerAddress", "type": "address" }, { "name": "_participantAddress", "type": "address" }], "name": "closeSwapByAdminAfterOneYear", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_secretHash", "type": "bytes20" }, { "name": "_participantAddress", "type": "address" }], "name": "createSwap", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_secret", "type": "bytes32" }, { "name": "_ownerAddress", "type": "address" }, { "name": "participantAddress", "type": "address" }], "name": "withdrawOther", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "ratingContractAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_ownerAddress", "type": "address" }], "name": "getTargetWallet", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "admin", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_ownerAddress", "type": "address" }], "name": "getBalance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_participantAddress", "type": "address" }], "name": "refund", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_buyer", "type": "address" }, { "indexed": false, "name": "_seller", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }, { "indexed": false, "name": "_secretHash", "type": "bytes20" }, { "indexed": false, "name": "createdAt", "type": "uint256" }], "name": "CreateSwap", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_buyer", "type": "address" }, { "indexed": false, "name": "_seller", "type": "address" }, { "indexed": false, "name": "_secretHash", "type": "bytes20" }, { "indexed": false, "name": "withdrawnAt", "type": "uint256" }], "name": "Withdraw", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_buyer", "type": "address" }, { "indexed": false, "name": "_seller", "type": "address" }], "name": "Close", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_buyer", "type": "address" }, { "indexed": false, "name": "_seller", "type": "address" }, { "indexed": false, "name": "_secretHash", "type": "bytes20" }], "name": "Refund", "type": "event" }],
        /* eslint-enable */
        fetchBalance: (address) => actions.eth.fetchBalance(address),
        estimateGasPrice: ({ speed } = {}) => helpers.eth.estimateGasPrice({ speed }),
      }),
      new BtcSwap({
        fetchBalance: (address) => actions.btc.fetchBalance(address),
        fetchUnspents: (scriptAddress) => actions.btc.fetchUnspents(scriptAddress),
        broadcastTx: (txRaw) => actions.btc.broadcastTx(txRaw),
        fetchTxInfo: (txid) => actions.btc.fetchTxInfo(txid),
        checkWithdraw: (scriptAddress) => actions.btc.checkWithdraw(scriptAddress),
        estimateFeeValue: ({ inSatoshis, speed, address, txSize } = {}) => helpers.btc.estimateFeeValue({ inSatoshis, speed, address, txSize }),
      }),
      new GhostSwap({
        fetchBalance: (address) => actions.ghost.fetchBalance(address),
        fetchUnspents: (scriptAddress) => actions.ghost.fetchUnspents(scriptAddress),
        broadcastTx: (txRaw) => actions.ghost.broadcastTx(txRaw),
        fetchTxInfo: (txid) => actions.ghost.fetchTxInfo(txid),
        checkWithdraw: (scriptAddress) => actions.ghost.checkWithdraw(scriptAddress),
        estimateFeeValue: ({ inSatoshis, speed, address, txSize } = {}) => helpers.ghost.estimateFeeValue({ inSatoshis, speed, address, txSize }),
      }),
      new NextSwap({
        fetchBalance: (address) => actions.next.fetchBalance(address),
        fetchUnspents: (scriptAddress) => actions.next.fetchUnspents(scriptAddress),
        broadcastTx: (txRaw) => actions.next.broadcastTx(txRaw),
        fetchTxInfo: (txid) => actions.next.fetchTxInfo(txid),
        checkWithdraw: (scriptAddress) => actions.next.checkWithdraw(scriptAddress),
        estimateFeeValue: ({ inSatoshis, speed, address, txSize } = {}) => helpers.next.estimateFeeValue({ inSatoshis, speed, address, txSize }),
      }),
      ...(Object.keys(config.erc20)
        .map(key =>
          new EthTokenSwap({
            name: key,
            tokenAbi: abi,
            address: config.swapContract.erc20,
            decimals: config.erc20[key].decimals,
            tokenAddress: config.erc20[key].address,
            fetchBalance: (address) => actions.token.fetchBalance(address, config.erc20[key].address, config.erc20[key].decimals),
            estimateGasPrice: ({ speed } = {}) => helpers.ethToken.estimateGasPrice({ speed }),
            /* eslint-disable */
            abi: [{ "constant": false, "inputs": [{ "name": "_secret", "type": "bytes32" }, { "name": "_ownerAddress", "type": "address" }], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_participantAddress", "type": "address" }], "name": "getSecret", "outputs": [{ "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_secretHash", "type": "bytes20" }, { "name": "_participantAddress", "type": "address" }, { "name": "_targetWallet", "type": "address" }, { "name": "_value", "type": "uint256" }, { "name": "_token", "type": "address" }], "name": "createSwapTarget", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_secret", "type": "bytes32" }, { "name": "participantAddress", "type": "address" }], "name": "withdrawNoMoney", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "swaps", "outputs": [{ "name": "token", "type": "address" }, { "name": "targetWallet", "type": "address" }, { "name": "secret", "type": "bytes32" }, { "name": "secretHash", "type": "bytes20" }, { "name": "createdAt", "type": "uint256" }, { "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_ownerAddress", "type": "address" }, { "name": "_participantAddress", "type": "address" }], "name": "closeSwapByAdminAfterOneYear", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_secretHash", "type": "bytes20" }, { "name": "_participantAddress", "type": "address" }, { "name": "_value", "type": "uint256" }, { "name": "_token", "type": "address" }], "name": "createSwap", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_secret", "type": "bytes32" }, { "name": "_ownerAddress", "type": "address" }, { "name": "participantAddress", "type": "address" }], "name": "withdrawOther", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "tokenOwnerAddress", "type": "address" }], "name": "getTargetWallet", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "admin", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_ownerAddress", "type": "address" }], "name": "getBalance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_participantAddress", "type": "address" }], "name": "refund", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "token", "type": "address" }, { "indexed": false, "name": "_buyer", "type": "address" }, { "indexed": false, "name": "_seller", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }, { "indexed": false, "name": "_secretHash", "type": "bytes20" }, { "indexed": false, "name": "createdAt", "type": "uint256" }], "name": "CreateSwap", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_buyer", "type": "address" }, { "indexed": false, "name": "_seller", "type": "address" }, { "indexed": false, "name": "_secretHash", "type": "bytes20" }, { "indexed": false, "name": "withdrawnAt", "type": "uint256" }], "name": "Withdraw", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_buyer", "type": "address" }, { "indexed": false, "name": "_seller", "type": "address" }, { "indexed": false, "name": "_secretHash", "type": "bytes20" }], "name": "Refund", "type": "event" }],
            /* eslint-enable */
          })
        )),
    ],
    flows: [
      ETH2BTC,
      BTC2ETH,

      // GHOST2BTC,
      // BTC2GHOST,

      GHOST2ETH,
      ETH2GHOST,

      //NEXT2BTC,
      //BTC2NEXT,

      NEXT2ETH,
      ETH2NEXT,

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

      // ...(Object.keys(config.erc20))
      //   .map(key => ETHTOKEN2USDT(key)),
      //
      // ...(Object.keys(config.erc20))
      //   .map(key => USDT2ETHTOKEN(key)),
    ],
  })

  // eslint-disable-next-line
  // process.env.MAINNET ? SwapApp.shared()._addSwap(
  //   new UsdtSwap({
  //     assetId: 31, // USDT
  //     fetchBalance: (address) => actions.usdt.fetchBalance(address, 31).then(res => res.balance),
  //     fetchUnspents: (scriptAddress) => actions.btc.fetchUnspents(scriptAddress),
  //     broadcastTx: (txRaw) => actions.btc.broadcastTx(txRaw),
  //     fetchTx: (hash) => actions.btc.fetchTx(hash),
  //   }),
  // ) : null

  window.SwapApp = SwapApp.shared()
}

export {
  createSwapApp,
}

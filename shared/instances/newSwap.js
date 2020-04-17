/* eslint-disable import/no-mutable-exports,max-len */
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'
import web3 from 'helpers/web3'
import * as bitcoin from 'bitcoinjs-lib'
import bitcoincash from 'bitcoincashjs-lib'
import coininfo from 'coininfo'

import abi from 'human-standard-token-abi'

import Channel from 'ipfs-pubsub-room'
import IPFS from 'ipfs'

import config from 'helpers/externalConfig'
import { initExternalConfig } from 'helpers/externalConfig'

import helpers, { constants as privateKeys, utils } from 'helpers'
import actions from 'redux/actions'

import SwapApp, { constants } from 'swap.app'
import SwapAuth from 'swap.auth'
import SwapRoom from 'swap.room'
import SwapOrders from 'swap.orders'
import { ETH2BTC, BTC2ETH, ETHTOKEN2BTC, BTC2ETHTOKEN, ETHTOKEN2USDT } from 'swap.flows'
import { EthSwap, EthTokenSwap, BtcSwap } from 'swap.swaps'


initExternalConfig()

const repo = utils.createRepo()
utils.exitListener()


const createSwapApp = () => {
  SwapApp.setup({
    network: process.env.MAINNET ? 'mainnet' : 'testnet',

    env: {
      web3,
      bitcoin,
      bitcoincash,
      coininfo,
      Ipfs: IPFS,
      IpfsRoom: Channel,
      storage: window.localStorage,
      sessionStorage: window.sessionStorage
    },

    services: [
      new SwapAuth({
        // TODO need init swapApp only after private keys created!!!!!!!!!!!!!!!!!!!
        eth: localStorage.getItem(privateKeys.privateKeyNames.eth),
        btc: localStorage.getItem(privateKeys.privateKeyNames.btc),
      }),
      new SwapRoom({
        repo,
        config: {
          Addresses: {
            Swarm: [
              config.ipfs.swarm,
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
        estimateFeeValue: ({ inSatoshis, speed, address, txSize } = {}) => helpers.btc.estimateFeeValue({ inSatoshis, speed, address, txSize }),
      }),
    ],
    flows: [
      ETH2BTC,
      BTC2ETH,

      ...(Object.keys(config.erc20))
        .map(key => ETHTOKEN2BTC(key)),

      ...(Object.keys(config.erc20))
        .map(key => BTC2ETHTOKEN(key)),

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

/* eslint-disable import/no-mutable-exports,max-len */
import { eos } from 'helpers/eos'
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'
import web3 from 'helpers/web3'
import bitcoin from 'bitcoinjs-lib'
import coininfo from 'coininfo'

import abi from 'human-standard-token-abi'

import Channel from 'ipfs-pubsub-room'
import IPFS from 'ipfs'

import config from 'app-config'
import { constants as privateKeys, utils } from 'helpers'
import actions from 'redux/actions'

import swapApp, { constants } from 'swap.app'
import SwapAuth from 'swap.auth'
import SwapRoom from 'swap.room'
import SwapOrders from 'swap.orders'
import { ETH2BTC, BTC2ETH, LTC2BTC, BTC2LTC, ETH2LTC, LTC2ETH, ETHTOKEN2BTC, BTC2ETHTOKEN, EOS2BTC, BTC2EOS, USDT2ETHTOKEN, ETHTOKEN2USDT } from 'swap.flows'
import { EthSwap, EthTokenSwap, BtcSwap, LtcSwap, EosSwap, UsdtSwap } from 'swap.swaps'


const repo = utils.createRepo()
utils.exitListener()

if (config && config.isWidget) {
  // Auto hot plug not exist token to core
  if (!constants.COINS[config.erc20token]) {
    constants.COINS[config.erc20token] = config.erc20token.toUpperCase()
  }
}

const createSwapApp = () => {

  swapApp.setup({
    network: process.env.MAINNET ? 'mainnet' : 'testnet',

    env: {
      eos,
      web3,
      bitcoin,
      coininfo,
      Ipfs: IPFS,
      IpfsRoom: Channel,
      storage: window.localStorage,
    },

    services: [
      new SwapAuth({
        // TODO need init swapApp only after private keys created!!!!!!!!!!!!!!!!!!!
        eth: localStorage.getItem(privateKeys.privateKeyNames.eth),
        btc: localStorage.getItem(privateKeys.privateKeyNames.btc),
        ltc: localStorage.getItem(privateKeys.privateKeyNames.ltc),
        eos: privateKeys.privateKeyNames.eosAccount,
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
        gasLimit: 3e5,
        /* eslint-disable */
        abi: [{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"getSecret","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"participantSigns","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"participantAddress","type":"address"}],"name":"withdrawNoMoney","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_participantAddress","type":"address"},{"name":"_targetWallet","type":"address"}],"name":"createSwapTarget","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"swaps","outputs":[{"name":"targetWallet","type":"address"},{"name":"secret","type":"bytes32"},{"name":"secretHash","type":"bytes20"},{"name":"createdAt","type":"uint256"},{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_participantAddress","type":"address"}],"name":"createSwap","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"},{"name":"participantAddress","type":"address"}],"name":"withdrawOther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ratingContractAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"getTargetWallet","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_buyer","type":"address"},{"indexed":false,"name":"_seller","type":"address"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"_secretHash","type":"bytes20"},{"indexed":false,"name":"createdAt","type":"uint256"}],"name":"CreateSwap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_buyer","type":"address"},{"indexed":false,"name":"_seller","type":"address"},{"indexed":false,"name":"withdrawnAt","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_buyer","type":"address"},{"indexed":false,"name":"_seller","type":"address"}],"name":"Close","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_buyer","type":"address"},{"indexed":false,"name":"_seller","type":"address"}],"name":"Refund","type":"event"}],
        /* eslint-enable */
        fetchBalance: (address) => actions.eth.fetchBalance(address),
      }),
      new BtcSwap({
        fetchBalance: (address) => actions.btc.fetchBalance(address),
        fetchUnspents: (scriptAddress) => actions.btc.fetchUnspents(scriptAddress),
        broadcastTx: (txRaw) => actions.btc.broadcastTx(txRaw),
      }),
      new LtcSwap({
        fetchBalance: (address) => actions.ltc.fetchBalance(address),
        fetchUnspents: (scriptAddress) => actions.ltc.fetchUnspents(scriptAddress),
        broadcastTx: (txRaw) => actions.ltc.broadcastTx(txRaw),
        fetchTx: (hash) => actions.ltc.fetchTx(hash),
      }),
      new EosSwap({
        swapAccount: config.swapContract.eos,
        swapLockPeriod: 300, // safe time in seconds
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
            /* eslint-disable */
            abi: [{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"getSecret","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_participantAddress","type":"address"},{"name":"_targetWallet","type":"address"},{"name":"_value","type":"uint256"},{"name":"_token","type":"address"}],"name":"createSwapTarget","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"participantAddress","type":"address"}],"name":"withdrawNoMoney","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"swaps","outputs":[{"name":"token","type":"address"},{"name":"targetWallet","type":"address"},{"name":"secret","type":"bytes32"},{"name":"secretHash","type":"bytes20"},{"name":"createdAt","type":"uint256"},{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_participantAddress","type":"address"},{"name":"_value","type":"uint256"},{"name":"_token","type":"address"}],"name":"createSwap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"},{"name":"participantAddress","type":"address"}],"name":"withdrawOther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenOwnerAddress","type":"address"}],"name":"getTargetWallet","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"_buyer","type":"address"},{"indexed":false,"name":"_seller","type":"address"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"_secretHash","type":"bytes20"},{"indexed":false,"name":"createdAt","type":"uint256"}],"name":"CreateSwap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_buyer","type":"address"},{"indexed":false,"name":"_seller","type":"address"},{"indexed":false,"name":"withdrawnAt","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[],"name":"Refund","type":"event"}],
            /* eslint-enable */
          })
        )),
    ],
    flows: [
      ETH2BTC,
      BTC2ETH,

      ETH2LTC,
      LTC2ETH,

      LTC2BTC,
      BTC2LTC,

      EOS2BTC,
      BTC2EOS,

      ...(Object.keys(config.erc20))
        .map(key => ETHTOKEN2BTC(key)),

      ...(Object.keys(config.erc20))
        .map(key => BTC2ETHTOKEN(key)),

      ...(Object.keys(config.erc20))
        .map(key => ETHTOKEN2USDT(key)),

      ...(Object.keys(config.erc20))
        .map(key => USDT2ETHTOKEN(key)),
    ],
  })

  // eslint-disable-next-line
  process.env.MAINNET ? swapApp._addSwap(
    new UsdtSwap({
      assetId: 31, // USDT
      fetchBalance: (address) => actions.usdt.fetchBalance(address, 31).then(res => res.balance),
      fetchUnspents: (scriptAddress) => actions.btc.fetchUnspents(scriptAddress),
      broadcastTx: (txRaw) => actions.btc.broadcastTx(txRaw),
      fetchTx: (hash) => actions.btc.fetchTx(hash),
    }),
  ) : null

  window.swapApp = swapApp
}

export {
  createSwapApp,
}

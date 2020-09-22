import SwapApp, { SwapInterface } from '../src/swap.app'

const swap = require('../src')

const constants = swap.constants

const SwapAuth = swap.auth
const SwapRoom = swap.room
const SwapOrders = swap.orders

const { EthSwap, EthTokenSwap, BtcSwap } = swap.swaps
const { ETH2BTC, BTC2ETH, ETHTOKEN2BTC, BTC2ETHTOKEN } = swap.flows

const Web3 = require('web3')

const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/<YOUR_KEY>'))
const bitcoin = require('bitcoinjs-lib')

const Ipfs = require('ipfs')
const IpfsRoom = require('ipfs-pubsub-room')

const { LocalStorage } = require('node-localstorage')

const config = require('./config')

SwapApp.setup({
  network: 'testnet',

  env: {
    web3,
    bitcoin,
    Ipfs,
    IpfsRoom,
    storage: new LocalStorage('./.storage'),
  },

  services: [
    new SwapAuth({
      eth: null,
      btc: null,
    }),
    new SwapRoom(config.swapRoom),
    new SwapOrders(),
  ],

  swaps: [
    new EthSwap(config.ethSwap),
    new BtcSwap(config.btcSwap),
    new EthTokenSwap(config.noxonTokenSwap),
    new EthTokenSwap(config.swapTokenSwap),
  ],

  flows: [
    ETH2BTC,
    BTC2ETH,
    ETHTOKEN2BTC(constants.COINS.noxon),
    BTC2ETHTOKEN(constants.COINS.noxon),
  ],
})

exports = module.exports = SwapApp.shared()

/* eslint-disable import/no-mutable-exports,max-len */
import { eos } from 'helpers/eos'
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'
import web3 from 'helpers/web3'
import bitcoin from 'bitcoinjs-lib'
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
import { ETH2BTC, BTC2ETH, ETHTOKEN2BTC, BTC2ETHTOKEN, EOS2BTC, BTC2EOS, USDT2ETHTOKEN, ETHTOKEN2USDT } from 'swap.flows'
import { EthSwap, EthTokenSwap, BtcSwap, EosSwap, UsdtSwap } from 'swap.swaps'


const repo = utils.createRepo()
utils.exitListener()

const createSwapApp = () => {
  swapApp.setup({
    network: process.env.MAINNET ? 'mainnet' : 'testnet',

    env: {
      eos,
      web3,
      bitcoin,
      Ipfs: IPFS,
      IpfsRoom: Channel,
      storage: window.localStorage,
    },

    services: [
      new SwapAuth({
        // TODO need init swapApp only after private keys created!!!!!!!!!!!!!!!!!!!
        eth: localStorage.getItem(privateKeys.privateKeyNames.eth),
        btc: localStorage.getItem(privateKeys.privateKeyNames.btc),
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
        gasLimit: 1e5,
        abi: [{ 'constant':false, 'inputs':[{ 'name':'val', 'type':'uint256' }], 'name':'testnetWithdrawn', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'_secret', 'type':'bytes32' }, { 'name':'_ownerAddress', 'type':'address' }], 'name':'withdraw', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':true, 'inputs':[{ 'name':'_participantAddress', 'type':'address' }], 'name':'getSecret', 'outputs':[{ 'name':'', 'type':'bytes32' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':true, 'inputs':[{ 'name':'', 'type':'address' }, { 'name':'', 'type':'address' }], 'name':'participantSigns', 'outputs':[{ 'name':'', 'type':'uint256' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':true, 'inputs':[], 'name':'owner', 'outputs':[{ 'name':'', 'type':'address' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':true, 'inputs':[{ 'name':'', 'type':'address' }, { 'name':'', 'type':'address' }], 'name':'swaps', 'outputs':[{ 'name':'secret', 'type':'bytes32' }, { 'name':'secretHash', 'type':'bytes20' }, { 'name':'createdAt', 'type':'uint256' }, { 'name':'balance', 'type':'uint256' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'_secretHash', 'type':'bytes20' }, { 'name':'_participantAddress', 'type':'address' }], 'name':'createSwap', 'outputs':[], 'payable':true, 'stateMutability':'payable', 'type':'function' }, { 'constant':true, 'inputs':[], 'name':'ratingContractAddress', 'outputs':[{ 'name':'', 'type':'address' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':true, 'inputs':[{ 'name':'_ownerAddress', 'type':'address' }], 'name':'getBalance', 'outputs':[{ 'name':'', 'type':'uint256' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'_participantAddress', 'type':'address' }], 'name':'refund', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'inputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'constructor' }, { 'anonymous':false, 'inputs':[{ 'indexed':false, 'name':'createdAt', 'type':'uint256' }], 'name':'CreateSwap', 'type':'event' }, { 'anonymous':false, 'inputs':[{ 'indexed':false, 'name':'_secret', 'type':'bytes32' }, { 'indexed':false, 'name':'addr', 'type':'address' }, { 'indexed':false, 'name':'amount', 'type':'uint256' }], 'name':'Withdraw', 'type':'event' }, { 'anonymous':false, 'inputs':[], 'name':'Close', 'type':'event' }, { 'anonymous':false, 'inputs':[], 'name':'Refund', 'type':'event' }],
        fetchBalance: (address) => actions.eth.fetchBalance(address),
      }),
      new BtcSwap({
        fetchBalance: (address) => actions.btc.fetchBalance(address),
        fetchUnspents: (scriptAddress) => actions.btc.fetchUnspents(scriptAddress),
        broadcastTx: (txRaw) => actions.btc.broadcastTx(txRaw),
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
            abi: [{ 'constant':false, 'inputs':[{ 'name':'_secret', 'type':'bytes32' }, { 'name':'_ownerAddress', 'type':'address' }], 'name':'withdraw', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':true, 'inputs':[{ 'name':'_participantAddress', 'type':'address' }], 'name':'getSecret', 'outputs':[{ 'name':'', 'type':'bytes32' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'_ratingContractAddress', 'type':'address' }], 'name':'setReputationAddress', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':true, 'inputs':[{ 'name':'', 'type':'address' }, { 'name':'', 'type':'address' }], 'name':'participantSigns', 'outputs':[{ 'name':'', 'type':'uint256' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':true, 'inputs':[], 'name':'owner', 'outputs':[{ 'name':'', 'type':'address' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'_ownerAddress', 'type':'address' }], 'name':'abort', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':true, 'inputs':[{ 'name':'', 'type':'address' }, { 'name':'', 'type':'address' }], 'name':'swaps', 'outputs':[{ 'name':'token', 'type':'address' }, { 'name':'secret', 'type':'bytes32' }, { 'name':'secretHash', 'type':'bytes20' }, { 'name':'createdAt', 'type':'uint256' }, { 'name':'balance', 'type':'uint256' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'_secretHash', 'type':'bytes20' }, { 'name':'_participantAddress', 'type':'address' }, { 'name':'_value', 'type':'uint256' }, { 'name':'_token', 'type':'address' }], 'name':'createSwap', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':true, 'inputs':[{ 'name':'_ownerAddress', 'type':'address' }], 'name':'checkSign', 'outputs':[{ 'name':'', 'type':'uint256' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'_participantAddress', 'type':'address' }], 'name':'close', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':true, 'inputs':[], 'name':'ratingContractAddress', 'outputs':[{ 'name':'', 'type':'address' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'_participantAddress', 'type':'address' }], 'name':'sign', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':true, 'inputs':[{ 'name':'_ownerAddress', 'type':'address' }], 'name':'getBalance', 'outputs':[{ 'name':'', 'type':'uint256' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'_participantAddress', 'type':'address' }], 'name':'refund', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'inputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'constructor' }, { 'anonymous':false, 'inputs':[], 'name':'Sign', 'type':'event' }, { 'anonymous':false, 'inputs':[{ 'indexed':false, 'name':'createdAt', 'type':'uint256' }], 'name':'CreateSwap', 'type':'event' }, { 'anonymous':false, 'inputs':[], 'name':'Withdraw', 'type':'event' }, { 'anonymous':false, 'inputs':[], 'name':'Close', 'type':'event' }, { 'anonymous':false, 'inputs':[], 'name':'Refund', 'type':'event' }, { 'anonymous':false, 'inputs':[], 'name':'Abort', 'type':'event' }],
          })
        )),
    ],
    flows: [
      ETH2BTC,
      BTC2ETH,

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

  process.env.MAINNET ? swapApp._addSwap(
    new UsdtSwap({
      assetId: 31, // USDT
      fetchBalance: (address) => actions.usdt.fetchBalance(address, 31).then(res => res.balance),
      fetchUnspents: (scriptAddress) => actions.btc.fetchUnspents(scriptAddress),
      broadcastTx: (txRaw) => actions.btc.broadcastTx(txRaw),
      fetchTx: (hash) => actions.btc.fetchTx(hash),
    }),
  ) : null
}

export {
  createSwapApp,
}

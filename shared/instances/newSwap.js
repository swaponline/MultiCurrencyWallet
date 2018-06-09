/* eslint-disable import/no-mutable-exports,max-len */
import web3 from 'helpers/web3'
import bitcoin from 'bitcoinjs-lib'

import swapApp from 'swap/swap.app'
import SwapAuth from 'swap/services/swap.auth'
import SwapRoom from 'swap/services/swap.room'
import SwapOrders from 'swap/services/swap.orders'
import { EthSwap, EthTokenSwap, BtcSwap } from 'swap/swap.swaps'

import actions from 'redux/actions'


const localClear = localStorage.clear.bind(localStorage)

localStorage.clear = () => {
  const ethPrivateKey = localStorage.getItem('testnet:eth:privateKey')
  const btcPrivateKey = localStorage.getItem('testnet:btc:privateKey')

  localClear()

  localStorage.setItem('testnet:eth:privateKey', ethPrivateKey)
  localStorage.setItem('testnet:btc:privateKey', btcPrivateKey)
}

swapApp.setup({
  network: 'testnet',
  env: {
    web3,
    bitcoin,
    Ipfs: window.Ipfs,
    IpfsRoom: window.IpfsRoom,
    storage: window.localStorage,
  },
  services: [
    new SwapAuth({
      eth: localStorage.getItem('testnet:eth:privateKey'),
      btc: localStorage.getItem('testnet:btc:privateKey'),
    }),
    new SwapRoom({
      EXPERIMENTAL: {
        pubsub: true,
      },
      config: {
        Addresses: {
          Swarm: [
            // '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
            '/dns4/star.wpmix.net/tcp/443/wss/p2p-websocket-star',
          ],
        },
      },
    }),
    new SwapOrders(),
  ],
  swaps: [
    new EthSwap({
      address: '0xe08907e0e010a339646de2cc56926994f58c4db2',
      abi: [ { 'constant': false, 'inputs': [ { 'name': '_ownerAddress', 'type': 'address' } ], 'name': 'abort', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'close', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_secretHash', 'type': 'bytes20' }, { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'createSwap', 'outputs': [], 'payable': true, 'stateMutability': 'payable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'refund', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_ratingContractAddress', 'type': 'address' } ], 'name': 'setReputationAddress', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'sign', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'inputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'constructor' }, { 'constant': false, 'inputs': [ { 'name': '_secret', 'type': 'bytes32' }, { 'name': '_ownerAddress', 'type': 'address' } ], 'name': 'withdraw', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '_ownerAddress', 'type': 'address' } ], 'name': 'checkSign', 'outputs': [ { 'name': '', 'type': 'uint256' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '_ownerAddress', 'type': 'address' }, { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'getInfo', 'outputs': [ { 'name': '', 'type': 'bytes32' }, { 'name': '', 'type': 'bytes20' }, { 'name': '', 'type': 'uint256' }, { 'name': '', 'type': 'uint256' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'getSecret', 'outputs': [ { 'name': '', 'type': 'bytes32' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [], 'name': 'owner', 'outputs': [ { 'name': '', 'type': 'address' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '', 'type': 'address' }, { 'name': '', 'type': 'address' } ], 'name': 'participantSigns', 'outputs': [ { 'name': '', 'type': 'uint256' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [], 'name': 'ratingContractAddress', 'outputs': [ { 'name': '', 'type': 'address' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '', 'type': 'address' }, { 'name': '', 'type': 'address' } ], 'name': 'swaps', 'outputs': [ { 'name': 'secret', 'type': 'bytes32' }, { 'name': 'secretHash', 'type': 'bytes20' }, { 'name': 'createdAt', 'type': 'uint256' }, { 'name': 'balance', 'type': 'uint256' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '_ownerAddress', 'type': 'address' }, { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'unsafeGetSecret', 'outputs': [ { 'name': '', 'type': 'bytes32' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' } ],
      fetchBalance: (address) => actions.ethereum.fetchBalance(address),
    }),
    new EthTokenSwap({
      address: '0x527458d3d3a3af763dbe2ccc5688d64161e81d97',
      abi: [ { 'constant': false, 'inputs': [ { 'name': '_ownerAddress', 'type': 'address' } ], 'name': 'abort', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'close', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_secretHash', 'type': 'bytes20' }, { 'name': '_participantAddress', 'type': 'address' }, { 'name': '_value', 'type': 'uint256' }, { 'name': '_token', 'type': 'address' } ], 'name': 'createSwap', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'refund', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_ratingContractAddress', 'type': 'address' } ], 'name': 'setReputationAddress', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'sign', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'inputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'constructor' }, { 'constant': false, 'inputs': [ { 'name': '_secret', 'type': 'bytes32' }, { 'name': '_ownerAddress', 'type': 'address' } ], 'name': 'withdraw', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '_ownerAddress', 'type': 'address' } ], 'name': 'checkSign', 'outputs': [ { 'name': '', 'type': 'uint256' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '_ownerAddress', 'type': 'address' }, { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'getInfo', 'outputs': [ { 'name': '', 'type': 'address' }, { 'name': '', 'type': 'bytes32' }, { 'name': '', 'type': 'bytes20' }, { 'name': '', 'type': 'uint256' }, { 'name': '', 'type': 'uint256' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'getSecret', 'outputs': [ { 'name': '', 'type': 'bytes32' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [], 'name': 'owner', 'outputs': [ { 'name': '', 'type': 'address' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '', 'type': 'address' }, { 'name': '', 'type': 'address' } ], 'name': 'participantSigns', 'outputs': [ { 'name': '', 'type': 'uint256' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [], 'name': 'ratingContractAddress', 'outputs': [ { 'name': '', 'type': 'address' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '', 'type': 'address' }, { 'name': '', 'type': 'address' } ], 'name': 'swaps', 'outputs': [ { 'name': 'token', 'type': 'address' }, { 'name': 'secret', 'type': 'bytes32' }, { 'name': 'secretHash', 'type': 'bytes20' }, { 'name': 'createdAt', 'type': 'uint256' }, { 'name': 'balance', 'type': 'uint256' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '_ownerAddress', 'type': 'address' }, { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'unsafeGetSecret', 'outputs': [ { 'name': '', 'type': 'bytes32' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' } ],
      tokenAddress: '0x60c205722c6c797c725a996cf9cca11291f90749',
      tokenAbi: [{ 'constant':true, 'inputs':[], 'name':'name', 'outputs':[{ 'name':'', 'type':'string' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'_spender', 'type':'address' }, { 'name':'_amount', 'type':'uint256' }], 'name':'approve', 'outputs':[{ 'name':'success', 'type':'bool' }], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':true, 'inputs':[], 'name':'totalSupply', 'outputs':[{ 'name':'', 'type':'uint256' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'_from', 'type':'address' }, { 'name':'_to', 'type':'address' }, { 'name':'_amount', 'type':'uint256' }], 'name':'transferFrom', 'outputs':[{ 'name':'success', 'type':'bool' }], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':false, 'inputs':[], 'name':'getBurnPrice', 'outputs':[{ 'name':'', 'type':'uint256' }], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':true, 'inputs':[], 'name':'decimals', 'outputs':[{ 'name':'', 'type':'uint8' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':true, 'inputs':[], 'name':'manager', 'outputs':[{ 'name':'', 'type':'address' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[], 'name':'unlockEmission', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':true, 'inputs':[{ 'name':'_owner', 'type':'address' }], 'name':'balanceOf', 'outputs':[{ 'name':'balance', 'type':'uint256' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':true, 'inputs':[], 'name':'emissionlocked', 'outputs':[{ 'name':'', 'type':'bool' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[], 'name':'acceptOwnership', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':false, 'inputs':[], 'name':'lockEmission', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':true, 'inputs':[], 'name':'owner', 'outputs':[{ 'name':'', 'type':'address' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':true, 'inputs':[], 'name':'symbol', 'outputs':[{ 'name':'', 'type':'string' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[], 'name':'burnAll', 'outputs':[{ 'name':'', 'type':'bool' }], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'_newManager', 'type':'address' }], 'name':'changeManager', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'_newOwner', 'type':'address' }], 'name':'changeOwner', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'_to', 'type':'address' }, { 'name':'_amount', 'type':'uint256' }], 'name':'transfer', 'outputs':[{ 'name':'success', 'type':'bool' }], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':true, 'inputs':[], 'name':'emissionPrice', 'outputs':[{ 'name':'', 'type':'uint256' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[], 'name':'addToReserve', 'outputs':[{ 'name':'', 'type':'bool' }], 'payable':true, 'stateMutability':'payable', 'type':'function' }, { 'constant':true, 'inputs':[], 'name':'burnPrice', 'outputs':[{ 'name':'', 'type':'uint256' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[{ 'name':'tokenAddress', 'type':'address' }, { 'name':'amount', 'type':'uint256' }], 'name':'transferAnyERC20Token', 'outputs':[{ 'name':'success', 'type':'bool' }], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'constant':true, 'inputs':[{ 'name':'_owner', 'type':'address' }, { 'name':'_spender', 'type':'address' }], 'name':'allowance', 'outputs':[{ 'name':'remaining', 'type':'uint256' }], 'payable':false, 'stateMutability':'view', 'type':'function' }, { 'constant':false, 'inputs':[], 'name':'NoxonInit', 'outputs':[{ 'name':'', 'type':'bool' }], 'payable':true, 'stateMutability':'payable', 'type':'function' }, { 'constant':false, 'inputs':[], 'name':'acceptManagership', 'outputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'function' }, { 'inputs':[], 'payable':false, 'stateMutability':'nonpayable', 'type':'constructor' }, { 'payable':true, 'stateMutability':'payable', 'type':'fallback' }, { 'anonymous':false, 'inputs':[{ 'indexed':true, 'name':'buyer', 'type':'address' }, { 'indexed':false, 'name':'ethers', 'type':'uint256' }, { 'indexed':false, 'name':'_emissionedPrice', 'type':'uint256' }, { 'indexed':false, 'name':'amountOfTokens', 'type':'uint256' }], 'name':'TokenBought', 'type':'event' }, { 'anonymous':false, 'inputs':[{ 'indexed':true, 'name':'buyer', 'type':'address' }, { 'indexed':false, 'name':'ethers', 'type':'uint256' }, { 'indexed':false, 'name':'_burnedPrice', 'type':'uint256' }, { 'indexed':false, 'name':'amountOfTokens', 'type':'uint256' }], 'name':'TokenBurned', 'type':'event' }, { 'anonymous':false, 'inputs':[{ 'indexed':false, 'name':'etherReserved', 'type':'uint256' }], 'name':'EtherReserved', 'type':'event' }, { 'anonymous':false, 'inputs':[{ 'indexed':true, 'name':'_from', 'type':'address' }, { 'indexed':true, 'name':'_to', 'type':'address' }, { 'indexed':false, 'name':'_value', 'type':'uint256' }], 'name':'Transfer', 'type':'event' }, { 'anonymous':false, 'inputs':[{ 'indexed':true, 'name':'_owner', 'type':'address' }, { 'indexed':true, 'name':'_spender', 'type':'address' }, { 'indexed':false, 'name':'_value', 'type':'uint256' }], 'name':'Approval', 'type':'event' }],
      fetchBalance: (address) => actions.token.fetchBalance(address),
    }),
    new BtcSwap({
      fetchBalance: (address) => actions.bitcoin.fetchBalance(address),
      fetchUnspents: (scriptAddress) => actions.bitcoin.fetchUnspents(scriptAddress),
      broadcastTx: (txRaw) => actions.bitcoin.broadcastTx(txRaw),
    }),
  ],
})


export {
  swapApp,
}

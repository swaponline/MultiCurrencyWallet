# Swap Core (`src/core`)

In-browser atomic swap protocol based on HTLC

Try demo at https://swaponline.io/#/exchange

**THIS IS ALPHA VERSION AND CAN BE CHANGED SIGNIFICANTLY**

Swap Core is a decentralized exchange protocol (DEP) for crosschain atomic swaps, based on HTLC. It is written on JavaScript and can be run in browser or via NodeJS.

*tags: HTLC, atomic swap, javascript, browser, crypto, bitcoin, ethereum, erc20*


## Supported currencies

| ticker    | title |
|-----------|---------|
| ETH       | Ethereum |
| * (ERC20) | Ethereum ERC20 tokens (USDT, ...) |
| BNB       | Binance coin |
| * (BEP20) | Binance smart chain BEP20 tokens (USDT, ...) |
| MATIC     | Matic token |
| * (ERC20MATIC) | Polygon ERC20 tokens (USDT, ...) |
| BTC       | Bitcoin |
| GHOST     | Ghost |
| NEXT      | NEXT.coin |

## Supported swap directions

| tx\rx        | ETH  | ERC20 | BNB | BEP20 | MATIC | ERC20MATIC | BTC | GHOST | NEXT |
|--------------|------|-------|-----|-------|-------|------------|-----|-------|------|
| ETH          |      |       |     |       |       |            |  +  |   +   |  +   |
| ERC20        |      |       |     |       |       |            |  +  |   +   |      |
| BNB          |      |       |     |       |       |            |  +  |       |      |
| BEP20        |      |       |     |       |       |            |  +  |       |      |
| MATIC        |      |       |     |       |       |            |     |       |      |
| ERC20MATIC   |      |       |     |       |       |            |  +  |       |      |
| BTC          |  +   |   +   |  +  |   +   |       |     +      |     |       |      |
| GHOST        |  +   |   +   |     |       |       |            |     |       |      |
| NEXT         |  +   |       |     |       |       |            |  +  |       |  +   |

## How it works step by step

*deprecated*

<table>
  <thead style="font-weight: bold;">
    <tr>
      <td>Alice persist</td>
      <td>Alice <b>BTC -> ETH</b></td>
      <td>Bob <b>ETH -> BTC</b></td>
      <td>Bob persist</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>EthContract.checkSign()</td>
      <td>1) Wait for sign</td>
      <td>1) Sign</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td>2) Create secret hash</td>
      <td rowspan="4">2) Wait for BTC script</td>
      <td rowspan="4">BtcSwap.checkBalance()</td>
    </tr>
    <tr>
      <td></td>
      <td>3) Check balance (if not enough wait until user fill balance on this step)</td>
      <!--td></td-->
      <!--td></td-->
    </tr>
    <tr>
      <td></td>
      <td>4) Create BTC script</td>
      <!--td></td-->
      <!--td></td-->
    </tr>
    <tr>
      <td></td>
      <td>5) Fund BTC script</td>
      <!--td></td-->
      <!--td></td-->
    </tr>
    <tr>
      <td rowspan="3">EthSwap.checkBalance()</td>
      <td rowspan="3">6) Wait for ETH contract</td>
      <td>3) Verify BTC script</td>
      <td></td>
    </tr>
    <tr>
      <!--td></td-->
      <!--td></td-->
      <td>4) Check balance (if not enough wait until user fill balance on this step)</td>
      <td></td>
    </tr>
    <tr>
      <!--td></td-->
      <!--td></td-->
      <td>5) Create ETH contract</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td>7) Withdraw from ETH contract</td>
      <td>6) Wait for withdraw from ETH contract</td>
      <td>EthSwap.getSecret()</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td>7) Withdraw from BTC script</td>
      <td></td>
    </tr>
  </tbody>
</table>


## Usage

Simplest config:
```js
import Web3 from 'web3'
import bitcoin from 'bitcoinjs-lib'

import swapApp, { constants } from 'swap.app'
import SwapAuth from 'swap.auth'
import SwapRoom from 'swap.room'
import SwapOrders from 'swap.orders'
import { EthSwap, EthTokenSwap, BtcSwap } from 'swap.swaps'
import { ETH2BTC, BTC2ETH, ETHTOKEN2BTC, BTC2ETHTOKEN } from 'swap.flows'


const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/<YOUR_KEY>'))

SwapApp.setup({
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
      eth: null,
      btc: null,
    }),
    new SwapRoom({
      EXPERIMENTAL: {
        pubsub: true,
      },
      config: {
        Addresses: {
          Swarm: [
            '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
          ],
        },
      },
    }),
    new SwapOrders(),
  ],

  swaps: [
    new EthSwap({
      address: '0xe08907e0e010a339646de2cc56926994f58c4db2',
      abi: [ { "constant": false, "inputs": [ { "name": "_ownerAddress", "type": "address" } ], "name": "abort", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "close", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_secretHash", "type": "bytes20" }, { "name": "_participantAddress", "type": "address" } ], "name": "createSwap", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "refund", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_ratingContractAddress", "type": "address" } ], "name": "setReputationAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "sign", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [ { "name": "_secret", "type": "bytes32" }, { "name": "_ownerAddress", "type": "address" } ], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_ownerAddress", "type": "address" } ], "name": "checkSign", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_ownerAddress", "type": "address" }, { "name": "_participantAddress", "type": "address" } ], "name": "getInfo", "outputs": [ { "name": "", "type": "bytes32" }, { "name": "", "type": "bytes20" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "getSecret", "outputs": [ { "name": "", "type": "bytes32" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" }, { "name": "", "type": "address" } ], "name": "participantSigns", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "ratingContractAddress", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" }, { "name": "", "type": "address" } ], "name": "swaps", "outputs": [ { "name": "secret", "type": "bytes32" }, { "name": "secretHash", "type": "bytes20" }, { "name": "createdAt", "type": "uint256" }, { "name": "balance", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_ownerAddress", "type": "address" }, { "name": "_participantAddress", "type": "address" } ], "name": "unsafeGetSecret", "outputs": [ { "name": "", "type": "bytes32" } ], "payable": false, "stateMutability": "view", "type": "function" } ],
      fetchBalance: (address) => request.fetchEthBalance(address),
    }),
    new BtcSwap({
      fetchBalance: (address) => request.fetchBtcBalance(address),
      fetchUnspents: (scriptAddress) => request.fetchBtcUnspents(scriptAddress),
      broadcastTx: (txRaw) => request.broadcastBtcTx(txRaw),
    }),
    new EthTokenSwap({
      name: constants.COINS.noxon,
      address: '0xBA5c6DC3CAcdE8EA754e47c817846f771944518F',
      abi: [{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"getSecret","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_ratingContractAddress","type":"address"}],"name":"setReputationAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"participantSigns","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"abort","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"swaps","outputs":[{"name":"token","type":"address"},{"name":"secret","type":"bytes32"},{"name":"secretHash","type":"bytes20"},{"name":"createdAt","type":"uint256"},{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_participantAddress","type":"address"},{"name":"_value","type":"uint256"},{"name":"_token","type":"address"}],"name":"createSwap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"checkSign","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"close","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ratingContractAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"sign","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[],"name":"Sign","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"createdAt","type":"uint256"}],"name":"CreateSwap","type":"event"},{"anonymous":false,"inputs":[],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[],"name":"Close","type":"event"},{"anonymous":false,"inputs":[],"name":"Refund","type":"event"},{"anonymous":false,"inputs":[],"name":"Abort","type":"event"}],
      tokenAddress: '0x60c205722c6c797c725a996cf9cca11291f90749',
      tokenAbi: [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"getBurnPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"manager","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unlockEmission","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"emissionlocked","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"lockEmission","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"burnAll","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newManager","type":"address"}],"name":"changeManager","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"emissionPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"addToReserve","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"burnPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"amount","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"NoxonInit","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"acceptManagership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"buyer","type":"address"},{"indexed":false,"name":"ethers","type":"uint256"},{"indexed":false,"name":"_emissionedPrice","type":"uint256"},{"indexed":false,"name":"amountOfTokens","type":"uint256"}],"name":"TokenBought","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"buyer","type":"address"},{"indexed":false,"name":"ethers","type":"uint256"},{"indexed":false,"name":"_burnedPrice","type":"uint256"},{"indexed":false,"name":"amountOfTokens","type":"uint256"}],"name":"TokenBurned","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"etherReserved","type":"uint256"}],"name":"EtherReserved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}],
      fetchBalance: (address) => ethereumInstance.fetchTokenBalance(address),
    }),
    new EthTokenSwap({
      name: constants.COINS.swap,
      address: '0xBA5c6DC3CAcdE8EA754e47c817846f771944518F',
      abi: [{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"getSecret","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_ratingContractAddress","type":"address"}],"name":"setReputationAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"participantSigns","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"abort","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"swaps","outputs":[{"name":"token","type":"address"},{"name":"secret","type":"bytes32"},{"name":"secretHash","type":"bytes20"},{"name":"createdAt","type":"uint256"},{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_participantAddress","type":"address"},{"name":"_value","type":"uint256"},{"name":"_token","type":"address"}],"name":"createSwap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"checkSign","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"close","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ratingContractAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"sign","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[],"name":"Sign","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"createdAt","type":"uint256"}],"name":"CreateSwap","type":"event"},{"anonymous":false,"inputs":[],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[],"name":"Close","type":"event"},{"anonymous":false,"inputs":[],"name":"Refund","type":"event"},{"anonymous":false,"inputs":[],"name":"Abort","type":"event"}],
      tokenAddress: '0x60c205722c6c797c725a996cf9cca11291f90749',
      tokenAbi: [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"getBurnPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"manager","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unlockEmission","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"emissionlocked","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"lockEmission","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"burnAll","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newManager","type":"address"}],"name":"changeManager","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"emissionPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"addToReserve","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"burnPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"amount","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"NoxonInit","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"acceptManagership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"buyer","type":"address"},{"indexed":false,"name":"ethers","type":"uint256"},{"indexed":false,"name":"_emissionedPrice","type":"uint256"},{"indexed":false,"name":"amountOfTokens","type":"uint256"}],"name":"TokenBought","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"buyer","type":"address"},{"indexed":false,"name":"ethers","type":"uint256"},{"indexed":false,"name":"_burnedPrice","type":"uint256"},{"indexed":false,"name":"amountOfTokens","type":"uint256"}],"name":"TokenBurned","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"etherReserved","type":"uint256"}],"name":"EtherReserved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}],
      fetchBalance: (address) => ethereumInstance.fetchTokenBalance(address),
    }),
  ],

  flows: [
    ETH2BTC,
    BTC2ETH,
    ETHTOKEN2BTC(constants.COINS.noxon),
    BTC2ETHTOKEN(constants.COINS.noxon),
  ],
})
```

```
import SwapApp, { constants } from 'swap.app'


SwapApp.services.orders.create({
  buyCurrency: constants.COINS.eth,
  sellCurrency: constants.COINS.btc,
  buyAmount: 10,
  sellAmount: 1,
})
```

`SwapApp.services.orders.getMyOrders()` returns

```
[
  {
    id: '...',
  }
]
```



## [swap.app] SwapApp

#### *SwapApp is singleton!*

#### Configure params

<table>
  <thead style="font-weight: bold;">
    <tr>
      <td>Option</td>
      <td style="min-width: 260px;">Value</td>
      <td>Description</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>network</td>
      <td><b>'mainnet'</b> or <b>'testnet'</b> (default)</td>
      <td></td>
    </tr>
    <tr>
      <td>env</td>
      <td>Map of environments</td>
      <td>
        Environment for API. Available env names: <b>web3</b>, <b>bitcoin</b>, <b>Ipfs</b> (required),
        <b>IpfsRoom</b> (required), <b>storage</b> (default: window.localStorage) Usage <b>SwapApp.env.{envName}<b>
      </td>
    </tr>
    <tr>
      <td>services</td>
      <td>Array of service instances</td>
      <td>Usage <b>SwapApp.services.{serviceName}</b></td>
    </tr>
    <tr>
      <td>swaps</td>
      <td>Array of swap instances</td>
      <td>All standard swaps stored in <b>swap.swaps</b> package</td>
    </tr>
    <tr>
      <td>flows</td>
      <td>Array of flow classes</td>
      <td>All standard flows stored in <b>swap.flows</b> package</td>
    </tr>
  </tbody>
</table>

#### Public props

<table>
  <thead style="font-weight: bold;">
    <tr>
      <td>Prop name</td>
      <td>Description</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>network</td>
      <td></td>
    </tr>
    <tr>
      <td>env</td>
      <td></td>
    </tr>
    <tr>
      <td>services</td>
      <td></td>
    </tr>
    <tr>
      <td>swaps</td>
      <td></td>
    </tr>
    <tr>
      <td>flows</td>
      <td></td>
    </tr>
  </tbody>
</table>

#### Public methods

<table>
  <thead style="font-weight: bold;">
    <tr>
      <td>Method</td>
      <td>Description</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>isMainNet()</td>
      <td>Returns <b>true</b> if SwapApp.network === 'mainnet'</td>
    </tr>
    <tr>
      <td>isTestNet()</td>
      <td>Returns <b>true</b> if SwapApp.network === 'testnet'</td>
    </tr>
  </tbody>
</table>


## * SwapApp Services

Each service class should extend swap.app/ServiceInterface

```
class ServiceInterface {

  // _constructor for aggregation
  _constructor() {
    // service name, within it will be stored in SwapApp.services
    this._serviceName     = null
    this._dependsOn       = []
    this._spyHandlers     = []
  }

  constructor() {
    this._constructor()
  }

  _waitRelationsResolve() {
    if (this._dependsOn && this._dependsOn.length) {
      const dependsOnMap = {}

      this._dependsOn.forEach((Service) => {
        dependsOnMap[Service.name] = {
          initialized: false,
        }
        SwapApp.services[Service.name]._addWaitRelationHandler(() => {
          this._dependsOn[Service.name].initialized = true

          const areAllExpectsInitialized = Object.keys(this._dependsOn).every((serviceName) => (
            this._dependsOn[serviceName].initialized
          ))

          if (areAllExpectsInitialized) {
            this.initService()
          }
        })
      })

      this._dependsOn = dependsOnMap
    }
  }

  _addWaitRelationHandler(handler) {
    this._spyHandlers.push(handler)
  }

  _tryInitService() {
    if (!this._dependsOn) {
      this.initService()
      this._spyHandlers.forEach((handler) => handler())
      this._spyHandlers = []
    }
  }

  initService() {
    // init service on SwapApp mounting
  }
}
```

This interface allows services to be mounted in right order (to not care of services position in setup array).
For example swap.orders depends on swap.room, so it must wait until swap.room be mounted in SwapApp.services.



## [swap.auth] SwapApp.services.auth

The service for authentication and storing auth data. Currently contains:

- **btc**
- **eth**
- **ghost**
- **sum**

```
new SwapAuth({
  eth: null,
  btc: null,
  ...
})
```

You can pass `null` or private key as value. If `null` passed new private key will be created, this key will be saved
in `SwapApp.env.storage` by key `{network}:{coinName}:privateKey` - for network: `testnet` and coin `eth` it will be
`testnet:eth:privateKey`

#### Public props

<table>
  <thead style="font-weight: bold;">
    <tr>
      <td>Prop name</td>
      <td>Description</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>accounts</td>
      <td></td>
    </tr>
  </tbody>
</table>

#### Public methods

<table>
  <thead style="font-weight: bold;">
    <tr>
      <td>Method</td>
      <td>Description</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>getPublicData()</td>
      <td>Returns <b>{ address, publicKey }</b> for each coin passed on initialization</td>
    </tr>
  </tbody>
</table>

#### * Extension

To extend auth service with new coins need to create new file with coin name (use eth.js / btc.js as example) and
add coin name to swap.app/constants/COINS.js



## [swap.room] SwapApp.services.room

Wrapper over [ipfs-pubsub-room](https://github.com/ipfs-shipyard/ipfs-pubsub-room) package. This service provides
a room based on an IPFS pub-sub channel. Emits membership events, listens for messages, broadcast and direct messages
to peers. Sends events about new orders, orders status change, swap state changes between two users, etc.

Only one argument available - config:

```
{
  EXPERIMENTAL: {
    pubsub: true,
  },
  config: {
    Addresses: {
      Swarm: [
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
      ],
    },
  },
}
```

#### Public props

<table>
  <thead style="font-weight: bold;">
    <tr>
      <td>Prop name</td>
      <td>Description</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>peer</td>
      <td>Current user peer</td>
    </tr>
  </tbody>
</table>

#### Public methods

<table>
  <thead style="font-weight: bold;">
    <tr>
      <td>Method name</td>
      <td>Description</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>on(eventName, handler)</td>
      <td></td>
    </tr>
    <tr>
      <td>off(eventName, handler)</td>
      <td></td>
    </tr>
    <tr>
      <td>once(eventName, handler)</td>
      <td>Call handler once and unsubscribe</td>
    </tr>
    <tr>
      <td>
<pre>
sendMessage([
  {
    event: 'new order',
    data: {
      order,
    },
  },
  ...
])
</pre>
      </td>
      <td>Accepts array of messages</td>
    </tr>
  </tbody>
</table>



## [swap.orders] SwapApp.services.orders

Provides the workflow with orders - create, store, update, remove orders.

#### Public methods

<table>
  <thead style="font-weight: bold;">
    <tr>
      <td>Method</td>
      <td>Description</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
<pre>
create({
  buyCurrency: 'ETH',
  sellCurrency: 'BTC',
  buyAmount: 10,
  sellAmount: 1,
  exchangeRate: 0.1,
})
</pre>
      </td>
      <td>
        Order entity allows to contain only certain props:
        <b>buyCurrency</b>, <b>sellCurrency</b>, <b>buyAmount</b>, <b>sellAmount</b>, <b>exchangeRate</b>
      </td>
    </tr>
    <tr>
      <td>remove(orderId)</td>
      <td></td>
    </tr>
    <tr>
      <td>getMyOrders()</td>
      <td>Get all my orders</td>
    </tr>
    <tr>
      <td>getPeerOrders(peer)</td>
      <td>Get all user's orders by his peer. If user offline returns <b>[ ]</b></td>
    </tr>
    <tr>
      <td>on(eventName, handler)</td>
      <td>Subscribe for event</td>
    </tr>
    <tr>
      <td>off(eventName, handler)</td>
      <td>Unsubscribe</td>
    </tr>
  </tbody>
</table>

#### Events

<table>
  <thead style="font-weight: bold;">
    <tr>
      <td>Event name</td>
      <td>Description</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>new orders</td>
      <td>Other user becomes online and send all his orders to other peers</td>
    </tr>
    <tr>
      <td>new order</td>
      <td>Other user creates an order</td>
    </tr>
    <tr>
      <td>remove order</td>
      <td>Other user removes an order</td>
    </tr>
  </tbody>
</table>



## [swap.swaps]

This package contains set of classes which provide functionality for swap operations:
deposit funds, check balance, withdraw, refund, abort swap, etc. Each file (class) written for specific
blockchain (EthSwap, BtcSwap) / coin (EthTokenSwap). These classes used inside Swap process by swap.flows,
developer needs only to pass necessary class to SwapApp setup config:

```
swapApp.setup({
  ...
  swaps: [
    new EthSwap({
      address: '0xdbC2395f753968a93465487022B0e5D8730633Ec',
      abi: [{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"getSecret","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_ratingContractAddress","type":"address"}],"name":"setReputationAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"participantSigns","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"abort","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"swaps","outputs":[{"name":"secret","type":"bytes32"},{"name":"secretHash","type":"bytes20"},{"name":"createdAt","type":"uint256"},{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_participantAddress","type":"address"}],"name":"createSwap","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"checkSign","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"close","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ratingContractAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"sign","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[],"name":"Sign","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"createdAt","type":"uint256"}],"name":"CreateSwap","type":"event"},{"anonymous":false,"inputs":[],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[],"name":"Close","type":"event"},{"anonymous":false,"inputs":[],"name":"Refund","type":"event"},{"anonymous":false,"inputs":[],"name":"Abort","type":"event"}],
      fetchBalance: (address) => ethereumInstance.fetchBalance(address),
    }),
    new BtcSwap({
      fetchBalance: (address) => bitcoinInstance.fetchBalance(address),
      fetchUnspents: (scriptAddress) => bitcoinInstance.fetchUnspents(scriptAddress),
      broadcastTx: (txRaw) => bitcoinInstance.broadcastTx(txRaw),
    }),
    ...
  ],
  ...
})
```

Each *Swap should extends swap.app/SwapInterface:

```
class SwapInterface {

  constructor() {
    // service name, within it will be stored in SwapApp.swaps
    this._swapName = null
  }

  _initSwap() {
    // init service on SwapApp mounting
  }
}
```

- `this._swapName` required by SwapApp setup process, within it will be stored in `SwapApp.swaps[_swapName]`
- `_initSwap()` will be called when swap be mounted


### BtcSwap

<details>
<summary>Public methods</summary>

```
/**
 *
 * @param {object} data
 * @param {string} data.secretHash
 * @param {string} data.ownerPublicKey
 * @param {string} data.recipientPublicKey
 * @param {number} data.lockTime
 * @returns {{scriptAddress: *, script: (*|{ignored})}}
 */
createScript(data)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.recipientPublicKey
 * @param {number} data.lockTime
 * @param {object} expected
 * @param {number} expected.value
 * @param {number} expected.lockTime
 * @param {string} expected.recipientPublicKey
 * @returns {Promise.<string>}
 */
checkScript(data, expected)
```

```
/**
 *
 * @param {object} data
 * @param {object} data.scriptValues
 * @param {BigNumber} data.amount
 * @param {function} handleTransactionHash
 * @returns {Promise}
 */
fundScript(data, handleTransactionHash)
```

```
/**
 *
 * @param {object|string} data - scriptValues or wallet address
 * @returns {Promise.<void>}
 */
getBalance(data)
```

```
/**
 *
 * @param {object} data
 * @param {object} data.scriptValues
 * @param {string} data.secret
 * @param {boolean} isRefund
 * @returns {Promise}
 */
getWithdrawRawTransaction(data, isRefund)
```

```
/**
 *
 * @param {object} data
 * @param {object} data.scriptValues
 * @param {string} data.secret
 * @param {boolean} isRefund
 * @returns {Promise}
 */
getWithdrawHexTransaction(data, isRefund)
```

```
/**
 *
 * @param {object} data
 * @param {object} data.scriptValues
 * @param {string} data.secret
 * @returns {Promise}
 */
getRefundRawTransaction(data)
```

```
/**
 *
 * @param {object} data
 * @param {object} data.scriptValues
 * @param {string} data.secret
 * @returns {Promise}
 */
getRefundHexTransaction(data)
```

```
/**
 *
 * @param {object} data
 * @param {object} data.scriptValues
 * @param {string} data.secret
 * @param {function} handleTransactionHash
 * @param {boolean} isRefund
 * @returns {Promise}
 */
withdraw(data, handleTransactionHash, isRefund)
```

```
/**
 *
 * @param {object} data
 * @param {object} data.scriptValues
 * @param {string} data.secret
 * @param {function} handleTransactionHash
 * @returns {Promise}
 */
refund(data, handleTransactionHash)
```
</details>


### EthSwap

<details>
<summary>Public methods</summary>

```
/**
 *
 * @param {object} data
 * @param {string} data.participantAddress
 * @param {function} handleTransactionHash
 * @returns {Promise}
 */
sign(data, handleTransactionHash)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.secretHash
 * @param {string} data.participantAddress
 * @param {number} data.amount
 * @param {function} handleTransactionHash
 * @returns {Promise}
 */
create(data, handleTransactionHash)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.ownerAddress
 * @returns {Promise}
 */
getBalance(data)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.ownerAddress
 * @param {BigNumber} data.expectedValue
 * @returns {Promise.<string>}
 */
checkBalance(data)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.secret
 * @param {string} data.ownerAddress
 * @param {function} handleTransactionHash
 * @returns {Promise}
 */
withdraw(data, handleTransactionHash)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.participantAddress
 * @param {function} handleTransactionHash
 * @returns {Promise}
 */
refund(data, handleTransactionHash)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.participantAddress
 * @returns {Promise}
 */
getSecret(data)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.participantAddress
 * @param handleTransactionHash
 * @returns {Promise}
 */
close(data, handleTransactionHash)
```
</details>


### EthTokenSwap

<details>
<summary>Public methods</summary>

```
/**
 *
 * @param {object} data
 * @param {string} data.participantAddress
 * @param {function} handleTransactionHash
 * @returns {Promise}
 */
sign(data, handleTransactionHash)
```

```
/**
 *
 * @param {object} data
 * @param {BigNumber} data.amount
 * @param {function} handleTransactionHash
 * @returns {Promise}
 */
approve(data, handleTransactionHash)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.owner
 * @param {string} data.spender
 * @returns {Promise}
 */
checkAllowance(data)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.secretHash
 * @param {string} data.participantAddress
 * @param {BigNumber} data.amount
 * @param {function} handleTransactionHash
 * @returns {Promise}
 */
create(data, handleTransactionHash)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.ownerAddress
 * @returns {Promise}
 */
getBalance(data)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.ownerAddress
 * @param {BigNumber} data.expectedValue
 * @returns {Promise.<string>}
 */
checkBalance(data)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.secret
 * @param {string} data.ownerAddress
 * @param {function} handleTransactionHash
 * @returns {Promise}
 */
withdraw(data, handleTransactionHash)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.participantAddress
 * @param {function} handleTransactionHash
 * @returns {Promise}
 */
refund(data, handleTransactionHash)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.participantAddress
 * @returns {Promise}
 */
getSecret(data)
```

```
/**
 *
 * @param {object} data
 * @param {string} data.participantAddress
 * @param handleTransactionHash
 * @returns {Promise}
 */
close(data, handleTransactionHash)
```
</details>



## [swap.flows]

This package contains set of classes which describe how swaps will be processed step by step.


### BTC2ETH

Requires: **BtcSwap**, **EthSwap**

### ETH2BTC

Requires: **BtcSwap**, **EthSwap**

### BTC2ETHTOKEN

_* Note this is class factory_

Requires: **BtcSwap**, **EthTokenSwap**

### ETHTOKEN2BTC

_* Note this is class factory_

Requires: **BtcSwap**, **EthTokenSwap**



## [swap.swap]

###_WILL_BE_SOON_


---

## Examples

Usage examples are located in `examples` directory.

## React

```
cd ./examples/react
npm i
npm start
```

## Vanilla

**Still not working**

## Your app

There are couple of ways to use swap.core packages in your app:

0. Copy whole src/ to your own app folder and use relative paths... a lot of pain

1. Use [app-module-path-node](https://github.com/patrick-steele-idem/app-module-path-node) to resolve module paths

2. Webpack - to resolve swap packages use [aliases](https://webpack.js.org/configuration/resolve/#resolve-alias)

```
resolve: {
  alias: {
    'swap.app': '<PATH_TO_SWAP.CORE>/src/swap.app',
    'swap.auth': '<PATH_TO_SWAP.CORE>/src/swap.auth',
    ...
  }
}
```


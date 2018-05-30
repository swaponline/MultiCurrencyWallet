import web3 from 'helpers/web3'
import { getState } from 'redux/core'
import bitcoinJsLib from 'bitcoinjs-lib'
import { SwapApp, setupEnv } from 'swap-core'


const { user: { ethData, btcData  } } = getState()

console.log('ethData', ethData)
console.log('btcData', btcData)

setupEnv({
  web3,
  bitcoinJs: bitcoinJsLib,
  Ipfs: global.Ipfs,
  IpfsRoom: global.IpfsRoom,
})

const swapApp = window.swapApp =new SwapApp({
  me: {
    reputation: 10,
    eth: {
      address: ethData.address,
      publicKey: ethData.publicKey,
    },
    btc: {
      address: btcData.address,
      publicKey: btcData.publicKey,
    },
  },
  config: {
    ipfs: {
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
      }
    },
  },
})

swapApp.on('ready', () => {
  console.log('swapApp ready')
  console.log('initial orders', swapApp.getOrders())
})

swapApp.on('user online', (peer) => {
  console.log('user online', peer)
})

swapApp.on('user offline', (peer) => {
  console.log('user offline', peer)
})

swapApp.on('new orders', (swaps) => {
  console.log('new orders', swaps)
})

swapApp.on('new order', (swap) => {
  console.log('new order', swap)
})

swapApp.on('remove order', (swap) => {
  console.log('remove order', swap)
})

swapApp.on('new order request', ({ swapId, participant }) => {
  console.error(`user ${participant.peer} requesting swap`, {
    swap: swapApp.orderCollection.getByKey(swapId),
    participant,
  })
})

export {
  swapApp
}


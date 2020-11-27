import { default as nextUtils } from '../../../../common/utils/coin/next'


const id = Math.random().toString().slice(2)

module.exports = {
  swapRoom: {
    roomName: 'testnet.swap.online',
    EXPERIMENTAL: {
      pubsub: true
    },
    config: {
      Addresses: {
        Swarm: [
          '/dns4/webrtc-star-1.swaponline.io/tcp/443/wss/p2p-webrtc-star/',
          // '/dns4/discovery.libp2p.array.io/tcp/9091/wss/p2p-websocket-star',
          //'/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
          //'/dns4/secure-beyond-12878.herokuapp.com/tcp/443/wss/p2p-webrtc-star/',
        ],
      },
    },
  },

  // flows for swap
  /*
  nextSwap: () => ({
    fetchBalance: (address) => bitcoin.fetchBalance(address),
    fetchUnspents: (scriptAddress) => bitcoin.fetchUnspents(scriptAddress),
    broadcastTx: (txRaw) => bitcoin.broadcastTx(txRaw),
    fetchTxInfo: txid => bitcoin.fetchTxInfo(txid),
    estimateFeeValue: ({ inSatoshis, speed, address, txSize } = {}) => bitcoin.estimateFeeValue({ inSatoshis, speed, address, txSize }),
    checkWithdraw: (scriptAddress) => bitcoin.checkWithdraw(scriptAddress),
  })*/
}
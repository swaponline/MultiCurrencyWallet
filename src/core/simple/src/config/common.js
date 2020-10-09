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
          // '/dns4/discovery.libp2p.array.io/tcp/9091/wss/p2p-websocket-star',
          //'/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
          '/dns4/secure-beyond-12878.herokuapp.com/tcp/443/wss/p2p-webrtc-star/',
        ],
      },
    },
  },
}
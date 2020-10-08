import Libp2p from 'libp2p'
import wrtc from 'wrtc'
import WebrtcStar from 'libp2p-webrtc-star'
import Bootstrap from 'libp2p-bootstrap'
import Gossipsub from 'libp2p-gossipsub'
import KadDHT from 'libp2p-kad-dht'
import MPLEX from 'libp2p-mplex'
import SECIO from 'libp2p-secio'


const createP2PNode = (options) => {
  const {
    listen,
    discoveryPeers,
  } = options || {}

  const defaultListen = [
    //'/ip4/0.0.0.0/tcp/4002',
    '/dns4/secure-beyond-12878.herokuapp.com/tcp/443/wss/p2p-webrtc-star/',
    //'/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
    //'/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/'
  ]

  const defaultDiscoveryPeers = [
    '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
    '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
    '/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
    '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
    '/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
    '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
  ]

  // Build and return our libp2p node
  return new Libp2p({
    peerId,
    addresses: {
      listen: listen || defaultListen,
    },
    connectionManager: {
      minPeers: 25,
      maxPeers: 100,
      pollInterval: 5000
    },
    modules: {
      transport: [WebrtcStar],
      streamMuxer: [MPLEX],
      connEncryption: [SECIO],
      peerDiscovery: [Bootstrap],
      dht: KadDHT,
      pubsub: Gossipsub
    },
    config: {
      transport: {
        [WebrtcStar.prototype[Symbol.toStringTag]]: {
          wrtc
        }
      },
      peerDiscovery: {
        autoDial: true,
        webRTCStar: {
          enabled: true
        },
        bootstrap: {
          enabled: true,
          interval: 30e3,
          list: discoveryPeers || defaultDiscoveryPeers,
        }
      },
      relay: {
        enabled: true,
        hop: {
          enabled: true,
          active: true,
        }
      },
      dht: {
        enabled: true,
        randomWalk: {
          enabled: true,
        }
      }
    }
  })
}


export default createP2PNode
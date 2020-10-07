import libp2p from 'libp2p'
import Websockets from 'libp2p-websockets'
import WebRTCStar from 'libp2p-webrtc-star'
import Mplex from 'libp2p-mplex'
import { NOISE } from 'libp2p-noise'
import Gossipsub from 'libp2p-gossipsub'
import Bootstrap from 'libp2p-bootstrap'


const createP2PNode = (options) => {
  const {
    listen,
    discoveryPeers,
  } = options || {}

  const defaultListen = [
    //'/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star/',
    '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
    //'/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
  ]

  const defaultDiscoveryPeers = [
    '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
    '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
    '/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
    '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
    '/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
    '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
  ]

  return new Promise(async (resolve, reject) => {
    try {
      const node = await libp2p.create({
        addresses: {
          listen: listen || defaultListen
        },
        modules: {
          transport: [Websockets, WebRTCStar],
          streamMuxer: [Mplex],
          connEncryption: [NOISE],
          pubsub: Gossipsub,
          peerDiscovery: [Bootstrap],
        },
          config: {
          peerDiscovery: {
            [Bootstrap.tag]: {
              enabled: true,
              list: discoveryPeers || defaultDiscoveryPeers,
            },
            [MulticastDNS.tag]: {
              interval: 20e3,
              enabled: true
            }
          }
        }
      })

      node.on('peer:discovery', (peerId) => {
        console.log('peer:discovery', peerId)
      })
      node.connectionManager.on('peer:connect', (connection) => {
        console.log(`Connected to ${connection.remotePeer.toB58String()}`)
      })

      // Listen for peers disconnecting
      node.connectionManager.on('peer:disconnect', (connection) => {
        console.log(`Disconnected from ${connection.remotePeer.toB58String()}`)
      })
      await node.start()
      resolve(node)
    } catch (error) {
      reject(error)
    }
  })
}



export default createP2PNode
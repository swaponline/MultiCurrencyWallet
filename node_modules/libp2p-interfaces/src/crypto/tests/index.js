/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))

const duplexPair = require('it-pair/duplex')
const { pipe } = require('it-pipe')
const PeerId = require('peer-id')
const { collect } = require('streaming-iterables')
const uint8arrayFromString = require('uint8arrays/from-string')

const peers = require('../../utils/peers')
const { UnexpectedPeerError } = require('../errors')

module.exports = (common) => {
  describe('interface-crypto', () => {
    let crypto
    let localPeer
    let remotePeer
    let mitmPeer

    before(async () => {
      [
        crypto,
        localPeer,
        remotePeer,
        mitmPeer
      ] = await Promise.all([
        common.setup(),
        PeerId.createFromJSON(peers[0]),
        PeerId.createFromJSON(peers[1]),
        PeerId.createFromJSON(peers[2])
      ])
    })

    after(() => common.teardown && common.teardown())

    it('has a protocol string', () => {
      expect(crypto.protocol).to.exist()
      expect(crypto.protocol).to.be.a('string')
    })

    it('it wraps the provided duplex connection', async () => {
      const [localConn, remoteConn] = duplexPair()

      const [
        inboundResult,
        outboundResult
      ] = await Promise.all([
        crypto.secureInbound(remotePeer, localConn),
        crypto.secureOutbound(localPeer, remoteConn, remotePeer)
      ])

      // Echo server
      pipe(inboundResult.conn, inboundResult.conn)

      // Send some data and collect the result
      const input = uint8arrayFromString('data to encrypt')
      const result = await pipe(
        [input],
        outboundResult.conn,
        // Convert BufferList to Buffer via slice
        (source) => (async function * toBuffer () {
          for await (const chunk of source) {
            yield chunk.slice()
          }
        })(),
        collect
      )

      expect(result).to.eql([input])
    })

    it('should return the remote peer id', async () => {
      const [localConn, remoteConn] = duplexPair()

      const [
        inboundResult,
        outboundResult
      ] = await Promise.all([
        crypto.secureInbound(remotePeer, localConn),
        crypto.secureOutbound(localPeer, remoteConn, remotePeer)
      ])

      // Inbound should return the initiator (local) peer
      expect(inboundResult.remotePeer.id).to.eql(localPeer.id)
      // Outbound should return the receiver (remote) peer
      expect(outboundResult.remotePeer.id).to.eql(remotePeer.id)
    })

    it('inbound connections should verify peer integrity if known', async () => {
      const [localConn, remoteConn] = duplexPair()

      await Promise.all([
        crypto.secureInbound(remotePeer, localConn, mitmPeer),
        crypto.secureOutbound(localPeer, remoteConn, remotePeer)
      ]).then(expect.fail, (err) => {
        expect(err).to.exist()
        expect(err).to.have.property('code', UnexpectedPeerError.code)
      })
    })
  })
}

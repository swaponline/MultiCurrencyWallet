/* eslint-env mocha */

'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))
const sinon = require('sinon')

const PeerId = require('peer-id')

const peers = require('../../utils/peers')

module.exports = (test) => {
  describe('multicodec topology', () => {
    let topology, id

    beforeEach(async () => {
      topology = await test.setup()
      if (!topology) throw new Error('missing multicodec topology')

      id = await PeerId.createFromJSON(peers[0])
    })

    afterEach(async () => {
      sinon.restore()
      await test.teardown()
    })

    it('should have properties set', () => {
      expect(topology.multicodecs).to.exist()
      expect(topology._onConnect).to.exist()
      expect(topology._onDisconnect).to.exist()
      expect(topology.peers).to.exist()
      expect(topology._registrar).to.exist()
    })

    it('should trigger "onDisconnect" on peer disconnected', () => {
      sinon.spy(topology, '_onDisconnect')
      topology.disconnect(id)

      expect(topology._onDisconnect.callCount).to.equal(1)
    })

    it('should update peers on protocol change', async () => {
      sinon.spy(topology, '_updatePeers')
      expect(topology.peers.size).to.eql(0)

      const peerStore = topology._registrar.peerStore

      const id2 = await PeerId.createFromJSON(peers[1])
      peerStore.peers.set(id2.toB58String(), {
        id: id2,
        protocols: Array.from(topology.multicodecs)
      })

      peerStore.emit('change:protocols', {
        peerId: id2,
        protocols: Array.from(topology.multicodecs)
      })

      expect(topology._updatePeers.callCount).to.equal(1)
      expect(topology.peers.size).to.eql(1)
    })

    it('should disconnect if peer no longer supports a protocol', async () => {
      sinon.spy(topology, '_onDisconnect')
      expect(topology.peers.size).to.eql(0)

      const peerStore = topology._registrar.peerStore

      const id2 = await PeerId.createFromJSON(peers[1])
      peerStore.peers.set(id2.toB58String(), {
        id: id2,
        protocols: Array.from(topology.multicodecs)
      })

      peerStore.emit('change:protocols', {
        peerId: id2,
        protocols: Array.from(topology.multicodecs)
      })

      expect(topology.peers.size).to.eql(1)

      peerStore.peers.set(id2.toB58String(), {
        id: id2,
        protocols: []
      })
      // Peer does not support the protocol anymore
      peerStore.emit('change:protocols', {
        peerId: id2,
        protocols: []
      })

      expect(topology.peers.size).to.eql(1)
      expect(topology._onDisconnect.callCount).to.equal(1)
      expect(topology._onDisconnect.calledWith(id2)).to.equal(true)
    })

    it('should trigger "onConnect" when a peer connects and has one of the topology multicodecs in its known protocols', () => {
      sinon.spy(topology, '_onConnect')
      sinon.stub(topology._registrar.peerStore.protoBook, 'get').returns(topology.multicodecs)

      topology._registrar.connectionManager.emit('peer:connect', {
        remotePeer: id
      })

      expect(topology._onConnect.callCount).to.equal(1)
    })

    it('should not trigger "onConnect" when a peer connects and has none of the topology multicodecs in its known protocols', () => {
      sinon.spy(topology, '_onConnect')
      sinon.stub(topology._registrar.peerStore.protoBook, 'get').returns([])

      topology._registrar.connectionManager.emit('peer:connect', {
        remotePeer: id
      })

      expect(topology._onConnect.callCount).to.equal(0)
    })

    it('should not trigger "onConnect" when a peer connects and its protocols are not known', () => {
      sinon.spy(topology, '_onConnect')
      sinon.stub(topology._registrar.peerStore.protoBook, 'get').returns(undefined)

      topology._registrar.connectionManager.emit('peer:connect', {
        remotePeer: id
      })

      expect(topology._onConnect.callCount).to.equal(0)
    })
  })
}

/* eslint-env mocha */

'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))
const sinon = require('sinon')

const PeerId = require('peer-id')
const peers = require('../../utils/peers')

module.exports = (test) => {
  describe('topology', () => {
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
      expect(topology.min).to.exist()
      expect(topology.max).to.exist()
      expect(topology._onConnect).to.exist()
      expect(topology._onDisconnect).to.exist()
      expect(topology.peers).to.exist()
    })

    it('should trigger "onDisconnect" on peer disconnected', () => {
      sinon.spy(topology, '_onDisconnect')
      topology.disconnect(id)

      expect(topology._onDisconnect.callCount).to.equal(1)
    })
  })
}

/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))

const multiaddr = require('multiaddr')
const PeerId = require('peer-id')

const delay = require('delay')
const pDefer = require('p-defer')

module.exports = (common) => {
  describe('interface-peer-discovery', () => {
    let discovery

    beforeEach(async () => {
      discovery = await common.setup()
    })

    afterEach('ensure discovery was stopped', async () => {
      await discovery.stop()

      discovery.removeAllListeners()

      common.teardown && common.teardown()
    })

    it('can start the service', async () => {
      await discovery.start()
    })

    it('can start and stop the service', async () => {
      await discovery.start()
      await discovery.stop()
    })

    it('should not fail to stop the service if it was not started', async () => {
      await discovery.stop()
    })

    it('should not fail to start the service if it is already started', async () => {
      await discovery.start()
      await discovery.start()
    })

    it('should emit a peer event after start', async () => {
      const defer = pDefer()
      await discovery.start()

      discovery.on('peer', ({ id, multiaddrs }) => {
        expect(id).to.exist()
        expect(PeerId.isPeerId(id)).to.eql(true)
        expect(multiaddrs).to.exist()

        multiaddrs.forEach((m) => expect(multiaddr.isMultiaddr(m)).to.eql(true))

        defer.resolve()
      })

      await defer.promise
    })

    it('should not receive a peer event before start', async () => {
      discovery.on('peer', () => {
        throw new Error('should not receive a peer event before start')
      })

      await delay(2000)
    })

    it('should not receive a peer event after stop', async () => {
      const deferStart = pDefer()

      await discovery.start()

      discovery.on('peer', () => {
        deferStart.resolve()
      })

      await deferStart.promise
      await discovery.stop()

      discovery.on('peer', () => {
        throw new Error('should not receive a peer event after stop')
      })

      await delay(2000)
    })
  })
}

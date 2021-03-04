/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const sinon = require('sinon')

const pWaitFor = require('p-wait-for')
const { pipe } = require('it-pipe')
const uint8arrayFromString = require('uint8arrays/from-string')
const { isValidTick } = require('./utils')

module.exports = (common) => {
  const upgrader = {
    _upgrade (multiaddrConnection) {
      ['sink', 'source', 'remoteAddr', 'conn', 'timeline', 'close'].forEach(prop => {
        expect(multiaddrConnection).to.have.property(prop)
      })
      expect(isValidTick(multiaddrConnection.timeline.open)).to.equal(true)

      return multiaddrConnection
    },
    upgradeOutbound (multiaddrConnection) {
      return upgrader._upgrade(multiaddrConnection)
    },
    upgradeInbound (multiaddrConnection) {
      return upgrader._upgrade(multiaddrConnection)
    }
  }

  describe('listen', () => {
    let addrs
    let transport

    before(async () => {
      ({ transport, addrs } = await common.setup({ upgrader }))
    })

    after(() => common.teardown && common.teardown())

    afterEach(() => {
      sinon.restore()
    })

    it('simple', async () => {
      const listener = transport.createListener((conn) => {})
      await listener.listen(addrs[0])
      await listener.close()
    })

    it('close listener with connections, through timeout', async () => {
      const upgradeSpy = sinon.spy(upgrader, 'upgradeInbound')
      const listenerConns = []

      const listener = transport.createListener((conn) => {
        listenerConns.push(conn)
        expect(upgradeSpy.returned(conn)).to.equal(true)
        pipe(conn, conn)
      })

      // Listen
      await listener.listen(addrs[0])

      // Create two connections to the listener
      const [socket1] = await Promise.all([
        transport.dial(addrs[0]),
        transport.dial(addrs[0])
      ])

      // Give the listener a chance to finish its upgrade
      await pWaitFor(() => listenerConns.length === 2)

      // Wait for the data send and close to finish
      await Promise.all([
        pipe(
          [uint8arrayFromString('Some data that is never handled')],
          socket1
        ),
        // Closer the listener (will take a couple of seconds to time out)
        listener.close()
      ])

      await socket1.close()

      expect(isValidTick(socket1.timeline.close)).to.equal(true)
      listenerConns.forEach(conn => {
        expect(isValidTick(conn.timeline.close)).to.equal(true)
      })

      // 2 dials = 2 connections upgraded
      expect(upgradeSpy.callCount).to.equal(2)
    })

    it('should not handle connection if upgradeInbound throws', async () => {
      sinon.stub(upgrader, 'upgradeInbound').throws()

      const listener = transport.createListener(() => {
        throw new Error('should not handle the connection if upgradeInbound throws')
      })

      // Listen
      await listener.listen(addrs[0])

      // Create a connection to the listener
      const socket = await transport.dial(addrs[0])

      await pWaitFor(() => typeof socket.timeline.close === 'number')
      await listener.close()
    })

    describe('events', () => {
      it('connection', (done) => {
        const upgradeSpy = sinon.spy(upgrader, 'upgradeInbound')
        const listener = transport.createListener()

        listener.on('connection', async (conn) => {
          expect(upgradeSpy.returned(conn)).to.equal(true)
          expect(upgradeSpy.callCount).to.equal(1)
          expect(conn).to.exist()
          await listener.close()
          done()
        })

        ;(async () => {
          await listener.listen(addrs[0])
          await transport.dial(addrs[0])
        })()
      })

      it('listening', (done) => {
        const listener = transport.createListener()
        listener.on('listening', async () => {
          await listener.close()
          done()
        })
        listener.listen(addrs[0])
      })

      it('error', (done) => {
        const listener = transport.createListener()
        listener.on('error', async (err) => {
          expect(err).to.exist()
          await listener.close()
          done()
        })
        listener.emit('error', new Error('my err'))
      })

      it('close', (done) => {
        const listener = transport.createListener()
        listener.on('close', done)

        ;(async () => {
          await listener.listen(addrs[0])
          await listener.close()
        })()
      })
    })
  })
}

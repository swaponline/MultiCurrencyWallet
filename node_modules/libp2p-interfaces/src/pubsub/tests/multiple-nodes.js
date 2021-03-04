/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 6] */
'use strict'

const chai = require('chai')
const { expect } = chai
const sinon = require('sinon')

const delay = require('delay')
const pDefer = require('p-defer')
const pWaitFor = require('p-wait-for')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')

const { expectSet } = require('./utils')

module.exports = (common) => {
  describe('pubsub with multiple nodes', function () {
    this.timeout(10e3)
    describe('every peer subscribes to the topic', () => {
      describe('line', () => {
        // line
        // ◉────◉────◉
        // a    b    c
        let psA, psB, psC

        // Create and start pubsub nodes
        beforeEach(async () => {
          [psA, psB, psC] = await common.setup(3)

          // Start pubsub mpdes
          ;[psA, psB, psC].map((p) => p.start())
        })

        // Connect nodes
        beforeEach(async () => {
          await psA._libp2p.dial(psB.peerId)
          await psB._libp2p.dial(psC.peerId)

          // Wait for peers to be ready in pubsub
          await pWaitFor(() =>
            psA.peers.size === 1 &&
            psC.peers.size === 1 &&
            psA.peers.size === 1
          )
        })

        afterEach(async () => {
          sinon.restore()

          ;[psA, psB, psC].map((p) => p.stop())
          await common.teardown()
        })

        it('subscribe to the topic on node a', async () => {
          const topic = 'Z'

          psA.subscribe(topic)
          expectSet(psA.subscriptions, [topic])

          await new Promise((resolve) => psB.once('pubsub:subscription-change', resolve))
          expect(psB.peers.size).to.equal(2)

          const aPeerId = psA.peerId.toB58String()
          expectSet(psB.topics.get(topic), [aPeerId])

          expect(psC.peers.size).to.equal(1)
          expect(psC.topics.get(topic)).to.eql(undefined)
        })

        it('subscribe to the topic on node b', async () => {
          const topic = 'Z'
          psB.subscribe(topic)
          expectSet(psB.subscriptions, [topic])

          await Promise.all([
            new Promise((resolve) => psA.once('pubsub:subscription-change', resolve)),
            new Promise((resolve) => psC.once('pubsub:subscription-change', resolve))
          ])

          expect(psA.peers.size).to.equal(1)
          expectSet(psA.topics.get(topic), [psB.peerId.toB58String()])

          expect(psC.peers.size).to.equal(1)
          expectSet(psC.topics.get(topic), [psB.peerId.toB58String()])
        })

        it('subscribe to the topic on node c', () => {
          const topic = 'Z'
          const defer = pDefer()

          psC.subscribe(topic)
          expectSet(psC.subscriptions, [topic])

          psB.once('pubsub:subscription-change', () => {
            expect(psA.peers.size).to.equal(1)
            expect(psB.peers.size).to.equal(2)
            expectSet(psB.topics.get(topic), [psC.peerId.toB58String()])

            defer.resolve()
          })

          return defer.promise
        })

        it('publish on node a', async () => {
          const topic = 'Z'
          const defer = pDefer()

          psA.subscribe(topic)
          psB.subscribe(topic)
          psC.subscribe(topic)

          // await subscription change
          await Promise.all([
            new Promise(resolve => psA.once('pubsub:subscription-change', () => resolve(null))),
            new Promise(resolve => psB.once('pubsub:subscription-change', () => resolve(null))),
            new Promise(resolve => psC.once('pubsub:subscription-change', () => resolve(null)))
          ])

          // await a cycle
          await delay(1000)

          let counter = 0

          psA.on(topic, incMsg)
          psB.on(topic, incMsg)
          psC.on(topic, incMsg)

          psA.publish(topic, uint8ArrayFromString('hey'))

          function incMsg (msg) {
            expect(uint8ArrayToString(msg.data)).to.equal('hey')
            check()
          }

          function check () {
            if (++counter === 3) {
              psA.removeListener(topic, incMsg)
              psB.removeListener(topic, incMsg)
              psC.removeListener(topic, incMsg)
              defer.resolve()
            }
          }

          return defer.promise
        })

        // since the topology is the same, just the publish
        // gets sent by other peer, we reused the same peers
        describe('1 level tree', () => {
          // 1 level tree
          //     ┌◉┐
          //     │b│
          //   ◉─┘ └─◉
          //   a     c

          it('publish on node b', async () => {
            const topic = 'Z'
            const defer = pDefer()
            let counter = 0

            psA.subscribe(topic)
            psB.subscribe(topic)
            psC.subscribe(topic)

            // await subscription change
            await Promise.all([
              new Promise(resolve => psA.once('pubsub:subscription-change', () => resolve(null))),
              new Promise(resolve => psB.once('pubsub:subscription-change', () => resolve(null))),
              new Promise(resolve => psC.once('pubsub:subscription-change', () => resolve(null)))
            ])

            psA.on(topic, incMsg)
            psB.on(topic, incMsg)
            psC.on(topic, incMsg)

            // await a cycle
            await delay(1000)

            psB.publish(topic, uint8ArrayFromString('hey'))

            function incMsg (msg) {
              expect(uint8ArrayToString(msg.data)).to.equal('hey')
              check()
            }

            function check () {
              if (++counter === 3) {
                psA.removeListener(topic, incMsg)
                psB.removeListener(topic, incMsg)
                psC.removeListener(topic, incMsg)
                defer.resolve()
              }
            }

            return defer.promise
          })
        })
      })

      describe('2 level tree', () => {
        // 2 levels tree
        //      ┌◉┐
        //      │c│
        //   ┌◉─┘ └─◉┐
        //   │b     d│
        // ◉─┘       └─◉
        // a
        let psA, psB, psC, psD, psE

        // Create and start pubsub nodes
        beforeEach(async () => {
          [psA, psB, psC, psD, psE] = await common.setup(5)

          // Start pubsub nodes
          ;[psA, psB, psC, psD, psE].map((p) => p.start())
        })

        // connect nodes
        beforeEach(async () => {
          await psA._libp2p.dial(psB.peerId)
          await psB._libp2p.dial(psC.peerId)
          await psC._libp2p.dial(psD.peerId)
          await psD._libp2p.dial(psE.peerId)

          // Wait for peers to be ready in pubsub
          await pWaitFor(() =>
            psA.peers.size === 1 &&
            psB.peers.size === 2 &&
            psC.peers.size === 2 &&
            psD.peers.size === 2 &&
            psE.peers.size === 1
          )
        })

        afterEach(async () => {
          [psA, psB, psC, psD, psE].map((p) => p.stop())
          await common.teardown()
        })

        it('subscribes', () => {
          psA.subscribe('Z')
          expectSet(psA.subscriptions, ['Z'])
          psB.subscribe('Z')
          expectSet(psB.subscriptions, ['Z'])
          psC.subscribe('Z')
          expectSet(psC.subscriptions, ['Z'])
          psD.subscribe('Z')
          expectSet(psD.subscriptions, ['Z'])
          psE.subscribe('Z')
          expectSet(psE.subscriptions, ['Z'])
        })

        it('publishes from c', async function () {
          this.timeout(30 * 1000)
          const defer = pDefer()
          let counter = 0

          psA.subscribe('Z')
          psA.on('Z', incMsg)
          psB.subscribe('Z')
          psB.on('Z', incMsg)
          psC.subscribe('Z')
          psC.on('Z', incMsg)
          psD.subscribe('Z')
          psD.on('Z', incMsg)
          psE.subscribe('Z')
          psE.on('Z', incMsg)

          await Promise.all([
            new Promise((resolve) => psA.once('pubsub:subscription-change', resolve)),
            new Promise((resolve) => psB.once('pubsub:subscription-change', resolve)),
            new Promise((resolve) => psC.once('pubsub:subscription-change', resolve)),
            new Promise((resolve) => psD.once('pubsub:subscription-change', resolve)),
            new Promise((resolve) => psE.once('pubsub:subscription-change', resolve))
          ])

          // await a cycle
          await delay(1000)

          psC.publish('Z', uint8ArrayFromString('hey from c'))

          function incMsg (msg) {
            expect(uint8ArrayToString(msg.data)).to.equal('hey from c')
            check()
          }

          function check () {
            if (++counter === 5) {
              psA.unsubscribe('Z', incMsg)
              psB.unsubscribe('Z', incMsg)
              psC.unsubscribe('Z', incMsg)
              psD.unsubscribe('Z', incMsg)
              psE.unsubscribe('Z', incMsg)
              defer.resolve()
            }
          }

          return defer.promise
        })
      })
    })

    describe('only some nodes subscribe the networks', () => {
      describe('line', () => {
        // line
        // ◉────◎────◉
        // a    b    c

        before(() => { })
        after(() => { })
      })

      describe('1 level tree', () => {
        // 1 level tree
        //     ┌◉┐
        //     │b│
        //   ◎─┘ └─◉
        //   a     c

        before(() => { })
        after(() => { })
      })

      describe('2 level tree', () => {
        // 2 levels tree
        //      ┌◉┐
        //      │c│
        //   ┌◎─┘ └─◉┐
        //   │b     d│
        // ◉─┘       └─◎
        // a           e

        before(() => { })
        after(() => { })
      })
    })
  })
}

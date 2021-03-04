/* eslint-env mocha */
'use strict'

const chai = require('chai')
const { expect } = chai
const sinon = require('sinon')

const uint8ArrayFromString = require('uint8arrays/from-string')

const topic = 'foo'
const data = uint8ArrayFromString('bar')
const shouldNotHappen = (_) => expect.fail()

module.exports = (common) => {
  describe('emit self', () => {
    let pubsub

    describe('enabled', () => {
      before(async () => {
        [pubsub] = await common.setup(1, { emitSelf: true })
      })

      before(() => {
        pubsub.start()
        pubsub.subscribe(topic)
      })

      after(async () => {
        sinon.restore()
        pubsub && pubsub.stop()
        await common.teardown()
      })

      it('should emit to self on publish', () => {
        const promise = new Promise((resolve) => pubsub.once(topic, resolve))

        pubsub.publish(topic, data)

        return promise
      })
    })

    describe('disabled', () => {
      before(async () => {
        [pubsub] = await common.setup(1, { emitSelf: false })
      })

      before(() => {
        pubsub.start()
        pubsub.subscribe(topic)
      })

      after(async () => {
        sinon.restore()
        pubsub && pubsub.stop()
        await common.teardown()
      })

      it('should not emit to self on publish', () => {
        pubsub.once(topic, (m) => shouldNotHappen)

        pubsub.publish(topic, data)

        // Wait 1 second to guarantee that self is not noticed
        return new Promise((resolve) => setTimeout(resolve, 1000))
      })
    })
  })
}

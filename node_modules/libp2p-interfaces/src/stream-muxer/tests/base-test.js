/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('chai-checkmark'))
const { expect } = chai
const pair = require('it-pair/duplex')
const { pipe } = require('it-pipe')
const { collect, map, consume } = require('streaming-iterables')

function close (stream) {
  return pipe([], stream, consume)
}

async function closeAndWait (stream) {
  await close(stream)
  expect(true).to.be.true.mark()
}

/**
 * A tick is considered valid if it happened between now
 * and `ms` milliseconds ago
 *
 * @param {number} date - Time in ticks
 * @param {number} ms - max milliseconds that should have expired
 * @returns {boolean}
 */
function isValidTick (date, ms = 5000) {
  const now = Date.now()
  if (date > now - ms && date <= now) return true
  return false
}

module.exports = (common) => {
  describe('base', () => {
    let Muxer

    beforeEach(async () => {
      Muxer = await common.setup()
    })

    it('Open a stream from the dialer', (done) => {
      const p = pair()
      const dialer = new Muxer()

      const listener = new Muxer({
        onStream: stream => {
          expect(stream).to.exist.mark() // 1st check
          expect(isValidTick(stream.timeline.open)).to.equal(true)
          // Make sure the stream is being tracked
          expect(listener.streams).to.include(stream)
          close(stream)
        },
        onStreamEnd: stream => {
          expect(stream).to.exist.mark() // 2nd check
          expect(listener.streams).to.not.include(stream)
          // Make sure the stream is removed from tracking
          expect(isValidTick(stream.timeline.close)).to.equal(true)
        }
      })

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      expect(3).checks(() => {
        // ensure we have no streams left
        expect(dialer.streams).to.have.length(0)
        expect(listener.streams).to.have.length(0)
        done()
      })

      const conn = dialer.newStream()
      expect(dialer.streams).to.include(conn)
      expect(isValidTick(conn.timeline.open)).to.equal(true)

      closeAndWait(conn) // 3rd check
    })

    it('Open a stream from the listener', (done) => {
      const p = pair()
      const dialer = new Muxer(stream => {
        expect(stream).to.exist.mark()
        expect(isValidTick(stream.timeline.open)).to.equal(true)
        closeAndWait(stream)
      })
      const listener = new Muxer()

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      expect(3).check(done)

      const conn = listener.newStream()
      expect(listener.streams).to.include(conn)
      expect(isValidTick(conn.timeline.open)).to.equal(true)

      closeAndWait(conn)
    })

    it('Open a stream on both sides', (done) => {
      const p = pair()
      const dialer = new Muxer(stream => {
        expect(stream).to.exist.mark()
        closeAndWait(stream)
      })
      const listener = new Muxer(stream => {
        expect(stream).to.exist.mark()
        closeAndWait(stream)
      })

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      expect(6).check(done)

      const listenerConn = listener.newStream()
      const dialerConn = dialer.newStream()

      closeAndWait(dialerConn)
      closeAndWait(listenerConn)
    })

    it('Open a stream on one side, write, open a stream on the other side', (done) => {
      const toString = map(c => c.slice().toString())
      const p = pair()
      const dialer = new Muxer()
      const listener = new Muxer(stream => {
        pipe(stream, toString, collect).then(chunks => {
          expect(chunks).to.be.eql(['hey']).mark()
        })

        dialer.onStream = onDialerStream

        const listenerConn = listener.newStream()

        pipe(['hello'], listenerConn)

        async function onDialerStream (stream) {
          const chunks = await pipe(stream, toString, collect)
          expect(chunks).to.be.eql(['hello']).mark()
        }
      })

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      expect(2).check(done)

      const dialerConn = dialer.newStream()

      pipe(['hey'], dialerConn)
    })
  })
}

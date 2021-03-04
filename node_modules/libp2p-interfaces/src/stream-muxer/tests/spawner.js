'use strict'

const { expect } = require('chai')
const pair = require('it-pair/duplex')
const { pipe } = require('it-pipe')

const pLimit = require('p-limit')
const { collect, tap, consume } = require('streaming-iterables')

module.exports = async (Muxer, nStreams, nMsg, limit) => {
  const [dialerSocket, listenerSocket] = pair()
  const { check, done } = marker((4 * nStreams) + (nStreams * nMsg))

  const msg = 'simple msg'

  const listener = new Muxer(async stream => {
    expect(stream).to.exist // eslint-disable-line
    check()

    await pipe(
      stream,
      tap(chunk => check()),
      consume
    )

    check()
    pipe([], stream)
  })

  const dialer = new Muxer()

  pipe(listenerSocket, listener, listenerSocket)
  pipe(dialerSocket, dialer, dialerSocket)

  const spawnStream = async n => {
    const stream = dialer.newStream()
    expect(stream).to.exist // eslint-disable-line
    check()

    const res = await pipe(
      (function * () {
        for (let i = 0; i < nMsg; i++) {
          // console.log('n', n, 'msg', i)
          yield new Promise(resolve => resolve(msg))
        }
      })(),
      stream,
      collect
    )

    expect(res).to.be.eql([])
    check()
  }

  const limiter = pLimit(limit || Infinity)

  await Promise.all(
    Array.from(Array(nStreams), (_, i) => limiter(() => spawnStream(i)))
  )

  return done
}

function marker (n) {
  /** @type {Function} */
  let check
  let i = 0

  /** @type {Promise<void>} */
  const done = new Promise((resolve, reject) => {
    check = err => {
      i++

      if (err) {
        /* eslint-disable-next-line */
        console.error('Failed after %s iterations', i)
        return reject(err)
      }

      if (i === n) {
        resolve()
      }
    }
  })

  // @ts-ignore - TS can't see that assignement occured
  return { check, done }
}

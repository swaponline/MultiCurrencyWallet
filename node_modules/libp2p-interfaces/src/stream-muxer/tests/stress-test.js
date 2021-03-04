/* eslint-env mocha */
'use strict'

const spawn = require('./spawner')

module.exports = (common) => {
  describe('stress test', () => {
    let Muxer

    beforeEach(async () => {
      Muxer = await common.setup()
    })

    it('1 stream with 1 msg', () => spawn(Muxer, 1, 1))
    it('1 stream with 10 msg', () => spawn(Muxer, 1, 10))
    it('1 stream with 100 msg', () => spawn(Muxer, 1, 100))
    it('10 streams with 1 msg', () => spawn(Muxer, 10, 1))
    it('10 streams with 10 msg', () => spawn(Muxer, 10, 10))
    it('10 streams with 100 msg', () => spawn(Muxer, 10, 100))
    it('100 streams with 1 msg', () => spawn(Muxer, 100, 1))
    it('100 streams with 10 msg', () => spawn(Muxer, 100, 10))
    it('100 streams with 100 msg', () => spawn(Muxer, 100, 100))
    it('1000 streams with 1 msg', () => spawn(Muxer, 1000, 1))
    it('1000 streams with 10 msg', () => spawn(Muxer, 1000, 10))
    it('1000 streams with 100 msg', function () {
      this.timeout(30 * 1000)
      return spawn(Muxer, 1000, 100)
    })
  })
}

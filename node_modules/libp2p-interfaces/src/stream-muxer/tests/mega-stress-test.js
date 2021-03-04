/* eslint-env mocha */
'use strict'

const spawn = require('./spawner')

module.exports = (common) => {
  describe.skip('mega stress test', function () {
    this.timeout(100 * 200 * 1000)
    let Muxer

    beforeEach(async () => {
      Muxer = await common.setup()
    })

    it('10,000 streams with 10,000 msg', () => spawn(Muxer, 10000, 10000, 5000))
  })
}

/* eslint-env mocha */

'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))

module.exports = (test) => {
  describe('record', () => {
    let record

    beforeEach(async () => {
      record = await test.setup()
      if (!record) throw new Error('missing record')
    })

    afterEach(() => test.teardown())

    it('has domain and codec', () => {
      expect(record.domain).to.exist()
      expect(record.codec).to.exist()
    })

    it('is able to marshal', () => {
      const rawData = record.marshal()
      expect(rawData).to.be.an.instanceof(Uint8Array)
    })

    it('is able to compare two records', () => {
      const equals = record.equals(record)
      expect(equals).to.eql(true)
    })
  })
}

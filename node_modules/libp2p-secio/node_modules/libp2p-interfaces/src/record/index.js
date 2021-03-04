'use strict'

const errcode = require('err-code')

/**
 * Record is the base implementation of a record that can be used as the payload of a libp2p envelope.
 */
class Record {
  /**
   * @constructor
   * @param {String} domain signature domain
   * @param {Buffer} codec identifier of the type of record
   */
  constructor (domain, codec) {
    this.domain = domain
    this.codec = codec
  }

  /**
   * Marshal a record to be used in an envelope.
   */
  marshal () {
    throw errcode(new Error('marshal must be implemented by the subclass'), 'ERR_NOT_IMPLEMENTED')
  }

  /**
   * Verifies if the other provided Record is identical to this one.
   * @param {Record} other
   */
  equals (other) {
    throw errcode(new Error('equals must be implemented by the subclass'), 'ERR_NOT_IMPLEMENTED')
  }
}

module.exports = Record

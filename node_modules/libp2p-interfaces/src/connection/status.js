'use strict'

const STATUS = {
  OPEN: /** @type {'open'} */('open'),
  CLOSING: /** @type {'closing'} */('closing'),
  CLOSED: /** @type {'closed'} */('closed')
}
module.exports = STATUS

/**
 * @typedef {STATUS[keyof STATUS]} Status
 */

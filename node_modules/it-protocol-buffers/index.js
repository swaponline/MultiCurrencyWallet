'use strict'

const lp = require('it-length-prefixed')
const it = require('./it')
const toBuffer = require('it-buffer')

module.exports.encode = (proto) => {
  return (source) => lp.encode()(it.encode(proto)(source))
}

module.exports.decode = (proto) => {
  return (source) => it.decode(proto)(toBuffer(lp.decode()(source)))
}

module.exports.it = it

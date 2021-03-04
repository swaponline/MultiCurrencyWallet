'use strict'

const toTransform = require('./transform')
const toDuplex = require('./duplex')

function toReadable (source, options) {
  return toDuplex({ source }, options)
}

function toWritable (sink, options) {
  return toDuplex({ sink }, options)
}

module.exports = toReadable
module.exports.readable = toReadable
module.exports.writable = toWritable
module.exports.transform = toTransform
module.exports.duplex = toDuplex

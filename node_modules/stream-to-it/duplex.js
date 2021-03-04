const toSink = require('./sink')
const toSource = require('./source')

module.exports = duplex => ({ sink: toSink(duplex), source: toSource(duplex) })

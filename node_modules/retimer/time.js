'use strict'

module.exports = function getTime () {
  var t = process.hrtime()
  return Math.floor(t[0] * 1000 + t[1] / 1000000)
}

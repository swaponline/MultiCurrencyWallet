'use strict'

const int32BEDecode = data => {
  if (data.length < 4) throw RangeError('Could not decode int32BE')
  return data.readInt32BE(0)
}

int32BEDecode.bytes = 4 // Always because fixed length

module.exports = int32BEDecode

const Crypto = require('crypto')

// Maximum is exclusive and the minimum is inclusive
const randomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

exports.randomInt = randomInt

const randomBytes = (min, max) => Crypto.randomBytes(randomInt(min, max))

exports.randomBytes = randomBytes

const BTC = require('./BTC')
const LTC = require('./LTC')
const GHOST = require('./GHOST')
const NEXT = require('./NEXT')

const coins = {
  [BTC.ticker]: BTC,
  [LTC.ticker]: LTC,
  [GHOST.ticker]: GHOST,
  [NEXT.ticker]: NEXT
}

module.exports = coins
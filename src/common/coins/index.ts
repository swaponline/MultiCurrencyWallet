import BTC from './BTC'
import LTC from './LTC'
import GHOST from './GHOST'
import NEXT from './NEXT'

const coins = {
  [BTC.ticker]: BTC,
  [LTC.ticker]: LTC,
  [GHOST.ticker]: GHOST,
  [NEXT.ticker]: NEXT
}

export default coins
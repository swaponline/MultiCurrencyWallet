import { constants } from 'swap.app'
import BtcToEthLike from './atomic/BtcToEthLike'


class BTC2BNB extends BtcToEthLike {
  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }

  static getFromName() {
    return constants.COINS.btc
  }

  static getToName() {
    return constants.COINS.bnb
  }

  constructor(swap) {
    swap = {
      ...swap,
      flowName: `BTC2BNB`,
    }
    super(swap)
  }
}

export default BTC2BNB

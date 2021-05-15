import { constants } from 'swap.app'
import BtcToEthLike from './atomic/BtcToEthLike'


class BTC2ETH extends BtcToEthLike {
  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }

  static getFromName() {
    return constants.COINS.btc
  }

  static getToName() {
    return constants.COINS.eth
  }

  constructor(swap) {
    swap.flowName = `BTC2ETH`
    super(swap)
  }
}

export default BTC2ETH

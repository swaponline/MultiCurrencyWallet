import { constants } from 'swap.app'
import BtcToEthLike from './atomic/BtcToEthLike'


class BTC2MATIC extends BtcToEthLike {
  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }
  static getFromName() {
    return constants.COINS.btc
  }
  static getToName() {
    return constants.COINS.matic
  }
  constructor(swap) {
    super(swap, {
      flowName: `BTC2MATIC`,
      getMyAddress: swap.app.getMyMaticAddress.bind(swap.app),
      getParticipantAddress: swap.app.getParticipantMaticAddress.bind(swap.app),
    })
  }
}

export default BTC2MATIC

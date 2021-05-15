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
    super(swap, {
      flowName: `BTC2BNB`,
      getMyAddress: swap.app.getMyBnbAddress,
      getParticipantAddress: swap.app.getParticipantBnbAddress,
    })
  }
}

export default BTC2BNB

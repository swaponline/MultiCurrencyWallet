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
    super(swap, {
      flowName: `BTC2ETH`,
      getMyAddress: swap.app.getMyEthAddress,
      getParticipantAddress: swap.app.getParticipantEthAddress,
    })
  }
}

export default BTC2ETH

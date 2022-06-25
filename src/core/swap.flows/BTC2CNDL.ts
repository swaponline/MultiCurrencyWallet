import { constants } from 'swap.app'
import BtcToEthLike from './atomic/BtcToEthLike'


class BTC2CNDL extends BtcToEthLike {
  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }
  static getFromName() {
    return constants.COINS.btc
  }
  static getToName() {
    return constants.COINS.cndl
  }
  constructor(swap) {
    super(swap, {
      flowName: `BTC2CNDL`,
      getMyAddress: swap.app.getMyCndlAddress.bind(swap.app),
      getParticipantAddress: swap.app.getParticipantCndlAddress.bind(swap.app),
    })
  }
}

export default BTC2CNDL

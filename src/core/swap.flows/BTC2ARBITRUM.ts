import { constants } from 'swap.app'
import BtcToEthLike from './atomic/BtcToEthLike'


class BTC2ARBITRUM extends BtcToEthLike {
  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }
  static getFromName() {
    return constants.COINS.btc
  }
  static getToName() {
    return constants.COINS.arbeth
  }
  constructor(swap) {
    super(swap, {
      flowName: `BTC2ARBITRUM`,
      getMyAddress: swap.app.getMyArbitrumAddress.bind(swap.app),
      getParticipantAddress: swap.app.getParticipantArbitrumAddress.bind(swap.app),
    })
  }
}

export default BTC2ARBITRUM

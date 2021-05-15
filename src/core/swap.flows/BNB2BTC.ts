import { constants } from 'swap.app'
import EthLikeToBtc from './atomic/EthLikeToBtc'


class BNB2BTC extends EthLikeToBtc {
  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }
  static getFromName() {
    return constants.COINS.bnb
  }
  static getToName() {
    return constants.COINS.btc
  }
  constructor(swap) {
    super(swap, {
      flowName: `BNB2BTC`,
      getMyAddress: swap.app.getMyBnbAddress,
      getParticipantAddress: swap.app.getParticipantBnbAddress,
    })
  }
}


export default BNB2BTC

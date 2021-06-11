import { constants } from 'swap.app'
import EthLikeToBtc from './atomic/EthLikeToBtc'


class MATIC2BTC extends EthLikeToBtc {
  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }
  static getFromName() {
    return constants.COINS.matic
  }
  static getToName() {
    return constants.COINS.btc
  }
  constructor(swap) {
    super(swap, {
      flowName: `MATIC2BTC`,
      getMyAddress: swap.app.getMyMaticAddress.bind(swap.app),
      getParticipantAddress: swap.app.getParticipantMaticAddress.bind(swap.app),
    })
  }
}

export default MATIC2BTC

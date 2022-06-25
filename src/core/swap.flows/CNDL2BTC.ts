import { constants } from 'swap.app'
import EthLikeToBtc from './atomic/EthLikeToBtc'


class CNDL2BTC extends EthLikeToBtc {
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
      flowName: `CNDL2BTC`,
      getMyAddress: swap.app.getMyCndlAddress.bind(swap.app),
      getParticipantAddress: swap.app.getParticipantCndlAddress.bind(swap.app),
    })
  }
}

export default CNDL2BTC

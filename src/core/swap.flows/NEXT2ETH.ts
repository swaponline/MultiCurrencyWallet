import { constants } from 'swap.app'
import NextToEvm from './atomic/NextToEvm'


class NEXT2ETH extends NextToEvm {
  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }
  static getFromName() {
    return constants.COINS.next
  }
  static getToName() {
    return constants.COINS.eth
  }
  constructor(swap) {
    super(swap, {
      flowName: NEXT2ETH.getName(),
      getMyAddress: swap.app.getMyEthAddress.bind(swap.app),
      getParticipantAddress: swap.app.getParticipantEthAddress.bind(swap.app),
    })
  }
}

export default NEXT2ETH

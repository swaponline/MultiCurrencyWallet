import { constants } from 'swap.app'
import EvmToNext from './atomic/EvmToNext'


class ETH2NEXT extends EvmToNext {
  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }
  static getFromName() {
    return constants.COINS.eth
  }
  static getToName() {
    return constants.COINS.next
  }
  constructor(swap) {
    super(swap, {
      flowName: ETH2NEXT.getName(),
      getMyAddress: swap.app.getMyEthAddress.bind(swap.app),
      getParticipantAddress: swap.app.getParticipantEthAddress.bind(swap.app),
    })
  }
}

export default ETH2NEXT

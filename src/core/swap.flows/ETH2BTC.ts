import { constants } from 'swap.app'
import EthLikeToBtc from './atomic/EthLikeToBtc'


class ETH2BTC extends EthLikeToBtc {
  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }
  static getFromName() {
    return constants.COINS.eth
  }
  static getToName() {
    return constants.COINS.btc
  }
  constructor(swap) {
    super(swap, {
      flowName: `ETH2BTC`,
      getMyAddress: swap.app.getMyEthAddress.bind(swap.app),
      getParticipantAddress: swap.app.getParticipantEthAddress.bind(swap.app),
    })
  }
}


export default ETH2BTC

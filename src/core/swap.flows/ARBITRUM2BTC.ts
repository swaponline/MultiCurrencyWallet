import { constants } from 'swap.app'
import EthLikeToBtc from './atomic/EthLikeToBtc'


class ARBITRUM2BTC extends EthLikeToBtc {
  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }
  static getFromName() {
    return constants.COINS.arbeth
  }
  static getToName() {
    return constants.COINS.btc
  }
  constructor(swap) {
    super(swap, {
      flowName: `ARBITRUM2BTC`,
      getMyAddress: swap.app.getMyArbitrumAddress.bind(swap.app),
      getParticipantAddress: swap.app.getParticipantArbitrumAddress.bind(swap.app),
    })
  }
}

export default ARBITRUM2BTC

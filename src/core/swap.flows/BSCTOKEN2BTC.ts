import { constants } from 'swap.app'
import EthLikeTokenToBtc from './atomic/EthLikeTokenToBtc'


export default (tokenName) => {

  class BSCTOKEN2BTC extends EthLikeTokenToBtc {
    static blockchainName = `BNB`
    _flowName: string

    static getName() {
      return `{${this.blockchainName}}${this.getFromName()}2${this.getToName()}`
    }
    static getFromName() {
      return tokenName.toUpperCase()
    }
    static getToName() {
      return constants.COINS.btc
    }

    constructor(swap) {
      super(swap, {
        blockchainName: `BNB`,
        tokenName,
        getMyAddress: swap.app.getMyBnbAddress.bind(swap.app),
        getParticipantAddress: swap.app.getParticipantBnbAddress.bind(swap.app),
      })
    }
  }

  return BSCTOKEN2BTC
}

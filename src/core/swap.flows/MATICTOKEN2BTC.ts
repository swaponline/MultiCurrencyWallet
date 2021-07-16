import { constants } from 'swap.app'
import EthLikeTokenToBtc from './atomic/EthLikeTokenToBtc'


export default (tokenName) => {

  class MATICTOKEN2BTC extends EthLikeTokenToBtc {
    static blockchainName = `MATIC`
    _flowName: string

    static getName() {
      return `${this.getFromName()}2${this.getToName()}`
    }
    static getFromName() {
      return `{${this.blockchainName}}${tokenName.toUpperCase()}`
    }
    static getToName() {
      return constants.COINS.btc
    }

    constructor(swap) {
      super(swap, {
        blockchainName: `MATIC`,
        tokenName,
        getMyAddress: swap.app.getMyMaticAddress.bind(swap.app),
        getParticipantAddress: swap.app.getParticipantMaticAddress.bind(swap.app),
      })
      this._flowName = MATICTOKEN2BTC.getName()
    }
  }

  return MATICTOKEN2BTC
}

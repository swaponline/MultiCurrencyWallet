import { constants } from 'swap.app'
import EthLikeTokenToBtc from './atomic/EthLikeTokenToBtc'


export default (tokenName) => {

  class CNDLTOKEN2BTC extends EthLikeTokenToBtc {
    static blockchainName = `CNDL`
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
        blockchainName: `CNDL`,
        tokenName,
        getMyAddress: swap.app.getMyCndlAddress.bind(swap.app),
        getParticipantAddress: swap.app.getParticipantCndlAddress.bind(swap.app),
      })
      this._flowName = CNDLTOKEN2BTC.getName()
    }
  }

  return CNDLTOKEN2BTC
}

import { constants } from 'swap.app'
import EthLikeTokenToBtc from './atomic/EthLikeTokenToBtc'


export default (tokenName) => {

  class ETHTOKEN2BTC extends EthLikeTokenToBtc {
    _flowName: string
    static blockchainName = `ETH`

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
        blockchainName: `ETH`,
        tokenName,
        getMyAddress: swap.app.getMyEthAddress.bind(swap.app),
        getParticipantAddress: swap.app.getParticipantEthAddress.bind(swap.app),
      })
      this._flowName = ETHTOKEN2BTC.getName()
    }
  }

  return ETHTOKEN2BTC
}

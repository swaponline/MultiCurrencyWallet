import { constants } from 'swap.app'
import BtcToEthLikeToken from './atomic/BtcToEthLikeToken'


export default (tokenName) => {

  class BTC2MATICTOKEN extends BtcToEthLikeToken {
    static blockchainName = `MATIC`
    _flowName: string

    static getName() {
      return `${this.getFromName()}2${this.getToName()}`
    }
    static getFromName() {
      return constants.COINS.btc
    }
    static getToName() {
      return `{${this.blockchainName}}${tokenName.toUpperCase()}`
    }

    constructor(swap) {
      super(swap, {
        blockchainName: `MATIC`,
        tokenName,
        getMyAddress: swap.app.getMyMaticAddress.bind(swap.app),
        getParticipantAddress: swap.app.getParticipantMaticAddress.bind(swap.app),
      })
      this._flowName = BTC2MATICTOKEN.getName()
    }
  }

  return BTC2MATICTOKEN
}

import { constants } from 'swap.app'
import BtcToEthLikeToken from './atomic/BtcToEthLikeToken'


export default (tokenName) => {

  class BTC2CNDLTOKEN extends BtcToEthLikeToken {
    static blockchainName = `CNDL`
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
        blockchainName: `CNDL`,
        tokenName,
        getMyAddress: swap.app.getMyCndlAddress.bind(swap.app),
        getParticipantAddress: swap.app.getParticipantCndlAddress.bind(swap.app),
      })
      this._flowName = BTC2CNDLTOKEN.getName()
    }
  }

  return BTC2CNDLTOKEN
}

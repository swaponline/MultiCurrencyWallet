import { constants } from 'swap.app'
import BtcToEthLikeToken from './atomic/BtcToEthLikeToken'


export default (tokenName) => {
  class BTC2ETHTOKEN extends BtcToEthLikeToken {
    _flowName: string
    static blockchainName = `ETH`

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
        blockchainName: `ETH`,
        tokenName,
        getMyAddress: swap.app.getMyEthAddress.bind(swap.app),
        getParticipantAddress: swap.app.getParticipantEthAddress.bind(swap.app),
      })

      this._flowName = BTC2ETHTOKEN.getName()
    }
  }

  return BTC2ETHTOKEN
}

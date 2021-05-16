import { constants } from 'swap.app'
import BtcToEthLikeToken from './atomic/BtcToEthLikeToken'


export default (tokenName) => {
  class BTC2BSCTOKEN extends BtcToEthLikeToken {
    _flowName: string

    static getName() {
      return `${this.getFromName()}2${this.getToName()}`
    }
    static getFromName() {
      return constants.COINS.btc
    }
    static getToName() {
      return tokenName.toUpperCase()
    }

    constructor(swap) {
      super(swap, {
        chainName: `BSC`,
        tokenName,
        getMyAddress: swap.app.getMyBnbAddress.bind(swap.app),
        getParticipantAddress: swap.app.getParticipantBnbAddress.bind(swap.app),
      })

      this._flowName = BTC2BSCTOKEN.getName()
    }
  }

  return BTC2BSCTOKEN
}

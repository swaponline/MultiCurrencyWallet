import { constants } from 'swap.app'
import EvmTokenToNext from './atomic/EvmTokenToNext'


export default (tokenName) => {

  class ETHTOKEN2NEXT extends EvmTokenToNext {
    _flowName: string

    static blockchainName = `ETH`
    static getName() {
      return `${this.getFromName()}2${this.getToName()}`
    }
    static getFromName() {
      return `{${this.blockchainName}}${tokenName.toUpperCase()}`
    }
    static getToName() {
      return constants.COINS.next
    }
    constructor(swap) {
      super(swap, {
        flowName: ETHTOKEN2NEXT.getName(),
        blockchainName: `ETH`,
        tokenName,
        getMyAddress: swap.app.getMyEthAddress.bind(swap.app),
        getParticipantAddress: swap.app.getParticipantEthAddress.bind(swap.app),
      })
      this._flowName = ETHTOKEN2NEXT.getName()
    }
  }

  return ETHTOKEN2NEXT
}

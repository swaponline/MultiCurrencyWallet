import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { AtomicAB2UTXO } from 'swap.swap'
import { BigNumber } from 'bignumber.js'
import { EthTokenSwap, BtcSwap } from 'swap.swaps'
import BtcToEthLikeToken from './atomic/BtcToEthLikeToken'


export default (tokenName) => {
  class BTC2ETHTOKEN extends BtcToEthLikeToken {
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
      super(tokenName, {
        chainName: `ETH`,
        tokenName,
        getMyAddress: swap.app.getMyEthAddress.bind(swap.app),
        getParticipantAddress: swap.app.getParticipantEthAddress.bind(swap.app),
      })

      this._flowName = BTC2ETHTOKEN.getName()
    }
  }

  return BTC2ETHTOKEN
}

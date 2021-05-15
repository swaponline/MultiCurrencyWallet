import { constants } from 'swap.app'
import EthLikeSwap from './EthLikeSwap'


class BnbSwap extends EthLikeSwap {
  constructor(options) {
    options = {
      ...options,
      getWeb3Adapter: `getBnbWeb3Adapter`,
      getWeb3Utils: `getBnbWeb3Utils`,
      getMyAddress: `getMyBnbAddress`,
      getParticipantAddress: `getParticipantBnbAddress`,
      coinName: constants.COINS.bnb
    }
    super(options)
  }
}


export default BnbSwap

import { constants } from 'swap.app'
import EthLikeTokenSwap from './EthLikeTokenSwap'


class BscTokenSwap extends EthLikeTokenSwap {
  constructor(options) {
    options = {
      ...options,
      getWeb3Adapter: `getBnbWeb3Adapter`,
      getWeb3Utils: `getBnbWeb3Utils`,
      getMyAddress: `getMyBnbAddress`,
      getParticipantAddress: `getParticipantBnbAddress`,
      blockchainName: constants.COINS.bnb,
      standard: constants.TOKEN_STANDARD.BEP20.toLowerCase(),
    }
    super(options)
  }
}


export default BscTokenSwap

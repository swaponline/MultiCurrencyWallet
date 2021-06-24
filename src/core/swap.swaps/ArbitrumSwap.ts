import { constants } from 'swap.app'
import EthLikeSwap from './EthLikeSwap'


class ArbitrumSwap extends EthLikeSwap {
  constructor(options) {
    options = {
      ...options,
      getWeb3Adapter: `getArbitrumWeb3Adapter`,
      getWeb3Utils: `getArbitrumWeb3Utils`,
      getMyAddress: `getMyArbitrumAddress`,
      getParticipantAddress: `getParticipantArbitrumAddress`,
      coinName: constants.COINS.arbeth
    }
    super(options)
  }
}


export default ArbitrumSwap

import { constants } from 'swap.app'
import EthLikeSwap from './EthLikeSwap'


class EthSwap extends EthLikeSwap {
  constructor(options) {
    options = {
      ...options,
      getWeb3Adapter: `getEthWeb3Adapter`,
      getWeb3Utils: `getEthWeb3Utils`,
      getMyAddress: `getMyEthAddress`,
      getParticipantAddress: `getParticipantEthAddress`,
      coinName: constants.COINS.eth
    }
    super(options)
  }
}


export default EthSwap

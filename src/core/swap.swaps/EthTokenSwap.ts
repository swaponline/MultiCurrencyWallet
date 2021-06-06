import { constants } from 'swap.app'
import EthLikeTokenSwap from './EthLikeTokenSwap'


class EthTokenSwap extends EthLikeTokenSwap {
  constructor(options) {
    options = {
      ...options,
      getWeb3Adapter: `getEthWeb3Adapter`,
      getWeb3Utils: `getEthWeb3Utils`,
      getMyAddress: `getMyEthAddress`,
      getParticipantAddress: `getParticipantEthAddress`,
      blockchainName: constants.COINS.eth
    }
    super(options)
  }
}


export default EthTokenSwap

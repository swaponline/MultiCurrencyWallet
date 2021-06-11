import { constants } from 'swap.app'
import EthLikeSwap from './EthLikeSwap'


class MaticSwap extends EthLikeSwap {
  constructor(options) {
    options = {
      ...options,
      getWeb3Adapter: `getMaticWeb3Adapter`,
      getWeb3Utils: `getMaticWeb3Utils`,
      getMyAddress: `getMyMaticAddress`,
      getParticipantAddress: `getParticipantMaticAddress`,
      coinName: constants.COINS.matic
    }
    super(options)
  }
}


export default MaticSwap

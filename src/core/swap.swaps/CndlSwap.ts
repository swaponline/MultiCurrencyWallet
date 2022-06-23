import { constants } from 'swap.app'
import EthLikeSwap from './EthLikeSwap'


class CndlSwap extends EthLikeSwap {
  constructor(options) {
    options = {
      ...options,
      getWeb3Adapter: `getCndlWeb3Adapter`,
      getWeb3Utils: `getCndlWeb3Utils`,
      getMyAddress: `getMyCndlAddress`,
      getParticipantAddress: `getParticipantCndlAddress`,
      coinName: constants.COINS.cndl
    }
    super(options)
  }
}


export default CndlSwap

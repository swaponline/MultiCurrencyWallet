import { constants } from 'swap.app'
import EthLikeTokenSwap from './EthLikeTokenSwap'


class CndlTokenSwap extends EthLikeTokenSwap {
  constructor(options) {
    options = {
      ...options,
      getWeb3Adapter: `getCndlWeb3Adapter`,
      getWeb3Utils: `getCndlWeb3Utils`,
      getMyAddress: `getMyCndlAddress`,
      getParticipantAddress: `getParticipantCndlAddress`,
      blockchainName: constants.COINS.cndl,
      standard: constants.TOKEN_STANDARD.ERC20CNDL.toLowerCase(),
    }
    super(options)
  }
}


export default CndlTokenSwap

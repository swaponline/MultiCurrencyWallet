import { constants } from 'swap.app'
import EthLikeTokenSwap from './EthLikeTokenSwap'


class MaticTokenSwap extends EthLikeTokenSwap {
  constructor(options) {
    options = {
      ...options,
      getWeb3Adapter: `getMaticWeb3Adapter`,
      getWeb3Utils: `getMaticWeb3Utils`,
      getMyAddress: `getMyMaticAddress`,
      getParticipantAddress: `getParticipantMaticAddress`,
      blockchainName: constants.COINS.matic,
      standard: constants.TOKEN_STANDARD.ERC20MATIC.toLowerCase(),
    }
    super(options)
  }
}


export default MaticTokenSwap

import constants from '../constants'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE, COIN_TYPE } from '../constants/COINS'
import typeforce from './typeforce'


const register = (code, precision) => {
  constants.COINS[code] = code.toUpperCase()
  constants.COIN_DATA[code.toUpperCase()] = {
    ticker: code.toUpperCase(),
    name: code.toUpperCase(),
    blockchain: BLOCKCHAIN_TYPE.BNB,
    type: COIN_TYPE.BNB_TOKEN,
    model: `AB`,
    precision: precision,
  }

  // @to-do - remove this
  typeforce.isCoinAddress[code.toUpperCase()] = typeforce.isCoinAddress.ETH
  typeforce.isCoinAddress[`{${BLOCKCHAIN_TYPE.BNB}}${code.toUpperCase()}`] = typeforce.isCoinAddress.BNB

  // @to-do - remove this too
  typeforce.isPublicKey[code.toUpperCase()] = typeforce.isPublicKey.ETH
  typeforce.isPublicKey[`{${BLOCKCHAIN_TYPE.BNB}}${code.toUpperCase()}`] = typeforce.isPublicKey.BNB
}

export default {
  register,
}

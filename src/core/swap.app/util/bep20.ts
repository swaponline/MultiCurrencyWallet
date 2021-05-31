import constants from '../constants'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE, COIN_TYPE, TOKEN_STANDARD } from '../constants/COINS'
import typeforce from './typeforce'


const register = (code, precision) => {
  constants.COINS[code] = code.toUpperCase()
  constants.COIN_DATA[code.toUpperCase()] = {
    ticker: code.toUpperCase(),
    name: code.toUpperCase(),
    blockchain: BLOCKCHAIN_TYPE.BNB,
    standart: TOKEN_STANDARD.BEP20,
    type: COIN_TYPE.BNB_TOKEN,
    model: `AB`,
    precision: precision,
  }
  constants.COIN_DATA[`{${BLOCKCHAIN_TYPE.BNB}}${code.toUpperCase()}`] = constants.COIN_DATA[code.toUpperCase()]

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

import constants from '../constants'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE, COIN_DATA, COIN_TYPE, TOKEN_STANDARD } from '../constants/COINS'
import typeforce from './typeforce'


const register = (code, precision) => {
  constants.COINS[code] = code.toUpperCase()
  constants.COIN_DATA[code.toUpperCase()] = {
    ticker: code.toUpperCase(),
    name: code.toUpperCase(),
    blockchain: BLOCKCHAIN_TYPE.BNB,
    standard: TOKEN_STANDARD.BEP20,
    type: COIN_TYPE.BNB_TOKEN,
    model: COIN_DATA.BNB.model,
    precision: precision,
  }
  constants.COIN_DATA[`{${BLOCKCHAIN_TYPE.BNB}}${code.toUpperCase()}`] = constants.COIN_DATA[code.toUpperCase()]

  // @to-do - remove this
  typeforce.isCoinAddress[code.toUpperCase()] = typeforce.isCoinAddress.BNB
  typeforce.isCoinAddress[`{${BLOCKCHAIN_TYPE.BNB}}${code.toUpperCase()}`] = typeforce.isCoinAddress.BNB

  // @to-do - remove this too
  typeforce.isPublicKey[code.toUpperCase()] = typeforce.isPublicKey.BNB
  typeforce.isPublicKey[`{${BLOCKCHAIN_TYPE.BNB}}${code.toUpperCase()}`] = typeforce.isPublicKey.BNB
}

export default {
  register,
}

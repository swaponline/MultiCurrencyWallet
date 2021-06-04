import constants from '../constants'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE, COIN_DATA, COIN_TYPE, TOKEN_STANDARD } from '../constants/COINS'
import typeforce from './typeforce'


const register = (code, precision) => {
  constants.COINS[code] = code.toUpperCase()
  constants.COIN_DATA[code.toUpperCase()] = {
    ticker: code.toUpperCase(),
    name: code.toUpperCase(),
    blockchain: BLOCKCHAIN_TYPE.MATIC,
    standard: TOKEN_STANDARD.ERC20MATIC,
    type: COIN_TYPE.MATIC_TOKEN,
    model: COIN_DATA.BNB.model,
    precision: precision,
  }
  constants.COIN_DATA[`{${BLOCKCHAIN_TYPE.MATIC}}${code.toUpperCase()}`] = constants.COIN_DATA[code.toUpperCase()]

  // @to-do - remove this
  typeforce.isCoinAddress[code.toUpperCase()] = typeforce.isCoinAddress.MATIC
  typeforce.isCoinAddress[`{${BLOCKCHAIN_TYPE.MATIC}}${code.toUpperCase()}`] = typeforce.isCoinAddress.MATIC

  // @to-do - remove this too
  typeforce.isPublicKey[code.toUpperCase()] = typeforce.isPublicKey.MATIC
  typeforce.isPublicKey[`{${BLOCKCHAIN_TYPE.MATIC}}${code.toUpperCase()}`] = typeforce.isPublicKey.MATIC
}

export default {
  register,
}

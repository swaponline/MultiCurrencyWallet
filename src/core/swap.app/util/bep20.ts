import constants from '../constants'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE, COIN_DATA, COIN_TYPE, TOKEN_STANDARD } from '../constants/COINS'
import typeforce from './typeforce'


const register = (code, precision) => {
  const tokenCode = `{${BLOCKCHAIN_TYPE.BNB}}${code}`
  constants.COINS[tokenCode] = tokenCode.toUpperCase()
  constants.COIN_DATA[tokenCode.toUpperCase()] = {
    ticker: tokenCode.toUpperCase(),
    name: code.toUpperCase(),
    blockchain: BLOCKCHAIN_TYPE.BNB,
    standard: TOKEN_STANDARD.BEP20,
    type: COIN_TYPE.BNB_TOKEN,
    model: COIN_DATA.BNB.model,
    precision: precision,
  }
  typeforce.isCoinAddress[tokenCode.toUpperCase()] = typeforce.isCoinAddress.BNB
  typeforce.isPublicKey[tokenCode.toUpperCase()] = typeforce.isPublicKey.BNB
}

export default {
  register,
}

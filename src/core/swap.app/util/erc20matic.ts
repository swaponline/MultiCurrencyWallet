import constants from '../constants'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE, COIN_DATA, COIN_TYPE, TOKEN_STANDARD } from '../constants/COINS'
import typeforce from './typeforce'


const register = (code, precision) => {
  const tokenCode = `{${BLOCKCHAIN_TYPE.MATIC}}${code}`
  constants.COINS[tokenCode] = tokenCode.toUpperCase()
  constants.COIN_DATA[tokenCode.toUpperCase()] = {
    ticker: tokenCode.toUpperCase(),
    name: code.toUpperCase(),
    blockchain: BLOCKCHAIN_TYPE.MATIC,
    standard: TOKEN_STANDARD.ERC20MATIC,
    type: COIN_TYPE.MATIC_TOKEN,
    model: COIN_DATA.BNB.model,
    precision: precision,
  }
  typeforce.isCoinAddress[tokenCode.toUpperCase()] = typeforce.isCoinAddress.MATIC
  typeforce.isPublicKey[tokenCode.toUpperCase()] = typeforce.isPublicKey.MATIC
}

export default {
  register,
}

import constants from '../constants'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE, COIN_DATA, COIN_TYPE, TOKEN_STANDARD } from '../constants/COINS'
import typeforce from './typeforce'

const register = (code, precision) => {
  const tokenCode = `{${BLOCKCHAIN_TYPE.MOVR}}${code}`
  constants.COINS[tokenCode] = tokenCode.toUpperCase()
  constants.COIN_DATA[tokenCode.toUpperCase()] = {
    ticker: tokenCode.toUpperCase(),
    name: code.toUpperCase(),
    blockchain: BLOCKCHAIN_TYPE.MOVR,
    standard: TOKEN_STANDARD.ERC20MOVR,
    type: COIN_TYPE.MOVR_TOKEN,
    model: COIN_DATA.MOVR.model,
    precision,
  }
  typeforce.isCoinAddress[tokenCode.toUpperCase()] = typeforce.isCoinAddress.MOVR
  typeforce.isPublicKey[tokenCode.toUpperCase()] = typeforce.isPublicKey.MOVR
}

export default {
  register,
}
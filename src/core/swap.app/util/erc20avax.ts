import constants from '../constants'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE, COIN_DATA, COIN_TYPE, TOKEN_STANDARD } from '../constants/COINS'
import typeforce from './typeforce'

const register = (code, precision) => {
  const tokenCode = `{${BLOCKCHAIN_TYPE.AVAX}}${code}`
  constants.COINS[tokenCode] = tokenCode.toUpperCase()
  constants.COIN_DATA[tokenCode.toUpperCase()] = {
    ticker: tokenCode.toUpperCase(),
    name: code.toUpperCase(),
    blockchain: BLOCKCHAIN_TYPE.AVAX,
    standard: TOKEN_STANDARD.ERC20AVAX,
    type: COIN_TYPE.AVAX_TOKEN,
    model: COIN_DATA.AVAX.model,
    precision,
  }
  typeforce.isCoinAddress[tokenCode.toUpperCase()] = typeforce.isCoinAddress.AVAX
  typeforce.isPublicKey[tokenCode.toUpperCase()] = typeforce.isPublicKey.AVAX
}

export default {
  register,
}

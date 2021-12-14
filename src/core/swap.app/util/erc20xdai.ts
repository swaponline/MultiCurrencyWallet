import constants from '../constants'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE, COIN_DATA, COIN_TYPE, TOKEN_STANDARD } from '../constants/COINS'
import typeforce from './typeforce'

const register = (code, precision) => {
  const tokenCode = `{${BLOCKCHAIN_TYPE.XDAI}}${code}`
  constants.COINS[tokenCode] = tokenCode.toUpperCase()
  constants.COIN_DATA[tokenCode.toUpperCase()] = {
    ticker: tokenCode.toUpperCase(),
    name: code.toUpperCase(),
    blockchain: BLOCKCHAIN_TYPE.XDAI,
    standard: TOKEN_STANDARD.ERC20XDAI,
    type: COIN_TYPE.XDAI_TOKEN,
    model: COIN_DATA.XDAI.model,
    precision,
  }
  typeforce.isCoinAddress[tokenCode.toUpperCase()] = typeforce.isCoinAddress.XDAI
  typeforce.isPublicKey[tokenCode.toUpperCase()] = typeforce.isPublicKey.XDAI
}

export default {
  register,
}
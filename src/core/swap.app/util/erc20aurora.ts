import constants from '../constants'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE, COIN_DATA, COIN_TYPE, TOKEN_STANDARD } from '../constants/COINS'
import typeforce from './typeforce'

const register = (code, precision) => {
  const tokenCode = `{${BLOCKCHAIN_TYPE.AURETH}}${code}`
  constants.COINS[tokenCode] = tokenCode.toUpperCase()
  constants.COIN_DATA[tokenCode.toUpperCase()] = {
    ticker: tokenCode.toUpperCase(),
    name: code.toUpperCase(),
    blockchain: BLOCKCHAIN_TYPE.AURETH,
    standard: TOKEN_STANDARD.ERC20AURORA,
    type: COIN_TYPE.AURORA_TOKEN,
    model: COIN_DATA.AURETH.model,
    precision,
  }
  typeforce.isCoinAddress[tokenCode.toUpperCase()] = typeforce.isCoinAddress.AURETH
  typeforce.isPublicKey[tokenCode.toUpperCase()] = typeforce.isPublicKey.AURETH
}

export default {
  register,
}
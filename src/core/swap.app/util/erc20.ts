import constants from '../constants'
import typeforce from './typeforce'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE, COIN_DATA, COIN_TYPE, TOKEN_STANDARD } from '../constants/COINS'


const register = (code, precision) => {
  const tokenCode = `{${BLOCKCHAIN_TYPE.ETH}}${code}`
  constants.COINS[tokenCode] = tokenCode.toUpperCase()
  constants.COIN_DATA[tokenCode.toUpperCase()] = {
    ticker: tokenCode.toUpperCase(),
    name: code.toUpperCase(),
    blockchain: BLOCKCHAIN_TYPE.ETH,
    standard: TOKEN_STANDARD.ERC20,
    type: COIN_TYPE.ETH_TOKEN,
    model: COIN_DATA.ETH.model,
    precision: precision,
  }
  typeforce.isCoinAddress[tokenCode.toUpperCase()] = typeforce.isCoinAddress.ETH
  typeforce.isPublicKey[tokenCode.toUpperCase()] = typeforce.isPublicKey.ETH
}

export default {
  register,
}

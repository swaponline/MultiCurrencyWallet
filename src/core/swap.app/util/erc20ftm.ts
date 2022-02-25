import constants from '../constants'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE, COIN_DATA, COIN_TYPE, TOKEN_STANDARD } from '../constants/COINS'
import typeforce from './typeforce'

const register = (code, precision) => {
  const tokenCode = `{${BLOCKCHAIN_TYPE.FTM}}${code}`
  constants.COINS[tokenCode] = tokenCode.toUpperCase()
  constants.COIN_DATA[tokenCode.toUpperCase()] = {
    ticker: tokenCode.toUpperCase(),
    name: code.toUpperCase(),
    blockchain: BLOCKCHAIN_TYPE.FTM,
    standard: TOKEN_STANDARD.ERC20FTM,
    type: COIN_TYPE.FTM_TOKEN,
    model: COIN_DATA.FTM.model,
    precision,
  }
  typeforce.isCoinAddress[tokenCode.toUpperCase()] = typeforce.isCoinAddress.FTM
  typeforce.isPublicKey[tokenCode.toUpperCase()] = typeforce.isPublicKey.FTM
}

export default {
  register,
}

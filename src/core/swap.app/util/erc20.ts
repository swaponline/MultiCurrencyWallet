import constants from '../constants'
import typeforce from './typeforce'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE, COIN_DATA, COIN_TYPE, TOKEN_STANDARD } from '../constants/COINS'


const register = (code, precision) => {
  constants.COINS[code] = code.toUpperCase()
  constants.COIN_DATA[code.toUpperCase()] = {
    ticker: code.toUpperCase(),
    name: code.toUpperCase(),
    blockchain: BLOCKCHAIN_TYPE.ETH,
    standard: TOKEN_STANDARD.ERC20,
    type: COIN_TYPE.ETH_TOKEN,
    model: COIN_DATA.ETH.model,
    precision: precision,
  }
  constants.COIN_DATA[`{${BLOCKCHAIN_TYPE.ETH}}${code.toUpperCase()}`] = constants.COIN_DATA[code.toUpperCase()]

  typeforce.isCoinAddress[code.toUpperCase()] = typeforce.isCoinAddress.ETH
  typeforce.isCoinAddress[`{${BLOCKCHAIN_TYPE.ETH}}${code.toUpperCase()}`] = typeforce.isCoinAddress.ETH

  typeforce.isPublicKey[code.toUpperCase()] = typeforce.isPublicKey.ETH
  typeforce.isPublicKey[`{${BLOCKCHAIN_TYPE.ETH}}${code.toUpperCase()}`] = typeforce.isPublicKey.ETH
}

export default {
  register,
}

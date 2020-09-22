import constants from '../constants'
import typeforce from './typeforce'


const register = (code, precision) => {
  constants.COINS[code] = code.toUpperCase()
  constants.COIN_DATA[code.toUpperCase()] = {
    ticker: code.toUpperCase(),
    name: code.toUpperCase(),
    type: `ETH_TOKEN`,
    model: `AB`,
    precision: precision,
  }

  typeforce.isCoinAddress[code.toUpperCase()] = typeforce.isCoinAddress.ETH
  typeforce.isPublicKey[code.toUpperCase()] = typeforce.isPublicKey.ETH
}

export default {
  register,
}

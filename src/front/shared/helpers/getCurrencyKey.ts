import ethToken from './ethToken'
import config from 'app-config'



export default (currency, returnToken) => {
  let key = currency.toLowerCase()

  if (config.binance && key === `bnb`) return `eth`

  switch (key) {
    case 'eth':
      return 'eth'
    case 'currency':
    case 'btc (sms-protected)':
    case 'btc (pin-protected)':
    case 'btc (multisig)':
      return 'btc'
    case 'ghost':
      return 'ghost'
    case 'next':
      return 'next'
  }

  if (ethToken.isEthToken({ name: key })) {
    key = (returnToken) ? key : 'token'
  }

  return key
}

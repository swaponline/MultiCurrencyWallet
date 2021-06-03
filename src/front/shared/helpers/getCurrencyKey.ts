import erc20Like from 'common/erc20Like'
import getCoinInfo from 'common/coins/getCoinInfo'


export default (currencyData, returnToken) => {
  const {
    coin: currency,
    blockchain,
  } = getCoinInfo(currencyData)

  let key = currency.toLowerCase()

  switch (key) {
    case 'currency':
    case 'btc (sms-protected)':
    case 'btc (pin-protected)':
    case 'btc (multisig)':
      return 'btc'
    case 'eth':
      return 'eth'
    case 'bnb':
      return 'bnb'
    case 'matic':
      return 'matic'
    case 'ghost':
      return 'ghost'
    case 'next':
      return 'next'
  }

  if (erc20Like.isToken({ name: key })) {
    key = (returnToken) ? key : 'token'
  }

  return key
}

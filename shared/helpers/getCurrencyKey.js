import ethToken from './ethToken'



export default (currency , returnToken) => {
  let key = currency.toLowerCase()
  switch (key) {
    case 'currency':
    case 'btc (sms-protected)':
    case 'btc (pin-protected)':
    case 'btc (multisig)':
      return 'btc'
    case 'eth':
      return 'eth'
  }

  if (ethToken.isEthToken({ name: key })) {
    key = (returnToken) ? key : 'token'
  }

  return key
}

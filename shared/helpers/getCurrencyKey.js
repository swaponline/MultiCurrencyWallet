



export default (currency) => {

  let key = currency.toLowerCase()
  switch (currency) {
    case 'currency':
    case 'btc (sms-protected)':
    case 'btc (multisig)':
      key = 'btc'
      break;
    case 'usdt (multisig)':
      key = 'usdt'
      break
    case 'eth':
    case 'bnb':
    case 'mdl':
    case 'snm':
    case 'proxima':
      key = 'eth'
      break;
    
  }

  return key
}
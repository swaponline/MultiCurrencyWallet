import erc20Like from 'common/erc20Like'

export default (currency, returnToken) => {
  let key = currency.toLowerCase()

  switch (key) {
    case 'currency':
    case 'btc (sms-protected)':
    case 'btc (pin-protected)':
    case 'btc (multisig)':
      key = 'btc'
  }

  if (erc20Like.isToken({ name: key })) {
    key = returnToken ? key : 'token'
  }

  return key
}

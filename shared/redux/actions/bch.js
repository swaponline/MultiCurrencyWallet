import bch from 'bitcoincashjs'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { constants, api, request, bcash } from 'helpers'


const login = (privateKey) => {
  let address

  if (privateKey) {
    address = new bch.PrivateKey(privateKey).toAddress(bcash.network)
  } else {
    privateKey  = new bch.PrivateKey(bcash.network)
    address = privateKey.toAddress(bcash.network)

    localStorage.setItem(constants.privateKeyNames.bch, privateKey.toWIF())
  }

  const { BitpayFormat, CashAddrFormat } = bch.Address

  const data = {
    addressBitpay: address.toString(BitpayFormat),
    address: address.toString(),
    privateKey,
  }

  reducers.user.setAuthData({ name: 'bchData', data })
}

const getBalance = () => {
  const { user: { bchData: { address } } } = getState()
  const url = `${api.getApiServer('bch')}/addr/${address}`

  return request.post('https://insticce.com/address', {
    url: 'https://insticce.com/address',
    method: 'post',
    json: {
      forwarding_address: `${address}`,
      callback_url: 'http://myurl.com/notify/path',
      testnet: 1,
      confirm: 0,
    },
  })
    .then(({ price }) => {
      reducers.user.setBalance({ name: 'bchData', amount: price })
      return price
    }, () => Promise.reject())
}

export default {
  login,
  getBalance,
}

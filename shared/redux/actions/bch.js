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
  }

  localStorage.setItem(constants.privateKeyNames.bch, privateKey)

  const data = {
    address: address.toString(),
    privateKey,
  }

  reducers.user.setAuthData({ name: 'bchData', data })
}

const getBalance = () => {
  const { user: { bchData: { address } } } = getState()
  const url = `${api.getApiServer('bch')}/addr/${address}`

  return request.get(url)
    .then(({ balance }) => {
      reducers.user.setBalance({ name: 'bchData', amount: balance })
      return balance
    }, () => Promise.reject())
}

export default {
  login,
  getBalance,
}

import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'
import bitcoinMessage from 'bitcoinjs-message'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { btc, request, constants, api } from 'helpers'
import { Keychain } from 'keychain.js'
import actions from 'redux/actions'

const invoiceApi = 'http://localhost:30150'

const validateData = (data) => {
  if (!data) return false
  if (!data.currency) return false
  if (!data.toAddress) return false
  if (!data.fromAddress) return false
  if (!data.amount) return false
  

  return true
}

const addInvoice = (data) => {
  const { user: { btcData } } = getState()

  if (!validateData(data)) return false

  const requestData = {
    currency    : data.currency,
    toAddress   : data.toAddress,
    fromAddress : data.fromAddress,
    amount      : data.amount,
    labal       : (data.label) ? data.label : '',
    address     : btcData.address,
    pubkey      : btcData.publicKey.toString('hex'),
    mainnet     : (btc.network==bitcoin.network.mainnet),
  }
  return request.post(`${invoiceApi}/push/`, {
    body: requestData
  })
  /*
  return request.get(`${api.getApiServer('bitpay')}/addr/${address}`)
    .then(({ balance, unconfirmedBalance }) => {
      console.log('BTC Balance: ', balance)
      console.log('BTC unconfirmedBalance Balance: ', unconfirmedBalance)
      reducers.user.setBalance({ name: 'btcData', amount: balance, unconfirmedBalance })
      return balance
    })
    .catch((e) => {
      reducers.user.setBalanceError({ name: 'btcData' })
    })
    */
}

const markInvoice = (invoiceId, mark, txid) => {
  const { user: { btcData } } = getState()
  
}

const getInvoices = (data) => {
  const { user: { btcData } } = getState()
  if (!data || !data.currency || !data.address) return false
  
  return request.post(`${invoiceApi}/history/`, {
    body: {
      currency: data.currency,
      address: data.addres,
      
    },
  })
}

export default {
  addInvoice,
}

import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'
import bitcoinMessage from 'bitcoinjs-message'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { btc, apiLooper, constants, api } from 'helpers'
import actions from 'redux/actions'
import config from 'helpers/externalConfig'
import getCurrencyKey from 'helpers/getCurrencyKey'


const validateData = (data) => {
  if (!data) return false
  if (!data.currency) return false
  // if (!data.toAddress) return false
  if (!data.fromAddress) return false
  if (!data.amount) return false


  return true
}

const addInvoice = (data) => {
  const { user: { btcData } } = getState()

  if (!validateData(data)) return false

  const currency = getCurrencyKey(data.currency, true)

  const requestData = {
    currency: currency.toUpperCase(),
    toAddress: data.toAddress,
    fromAddress: data.fromAddress,
    amount: data.amount,
    contact: data.contact,
    label: (data.label) ? data.label : '',
    address: btcData.address,
    pubkey: btcData.publicKey.toString('hex'),
    mainnet: (process.env.MAINNET) ? '1' : '0',
    destination: (data.destination) ? data.destination : '',
  }

  return apiLooper.post('invoiceApi', `/invoice/push/`, {
    body: requestData,
  })
}

const cancelInvoice = (invoiceId) => new Promise((resolve) => apiLooper.post('invoiceApi', `/invoice/cancel/`,
  {
    body: {
      invoiceId,
    },
  })
  .then((res: any) => {
    resolve(res && res.answer && res.answer === 'ok')
  })
  .catch(() => { resolve(false) }))

const markInvoice = (invoiceId, mark, txid, address) => new Promise((resolve) => apiLooper.post('invoiceApi', `/invoice/mark/`,
  {
    body: {
      invoiceId,
      mark,
      txid,
      address,
    },
  })
  .then((res: any) => {
    resolve(res && res.answer && res.answer === 'ok')
  })
  .catch(() => { resolve(false) }))

const getInvoice = (hash) => {
  if (!config.opts.invoiceEnabled) {
    return new Promise((resolve) => { resolve(false) })
  }

  return new Promise((resolve) => {

    apiLooper.post('invoiceApi', `/invoice/get`, {
      body: {
        hash,
      },
    }).then((res: any) => {
      console.log('fetced answer from invoice api', res)
      if (res && res.answer && res.answer === 'ok' && res.item) {
        const {
          item,
          item: {
            amount,
            utx,
          },
        } = res

        const direction = (actions.user.isOwner(item.toAddress, item.type)) ? 'in' : 'out'
        const isOwner = (actions.user.isOwner(item.fromAddress, item.type))

        resolve({
          invoiceData: item,
          isOwner,
          hasPayer: !(!item.toAddress),
          hash: 'no hash',
          confirmations: 1,
          value: amount,
          date: utx * 1000,
          direction,
        })
      } else {
        resolve(false)
      }
    }).catch(() => {
      resolve(false)
    })
  })
}

const getManyInvoices = (data) => {
  if (!config.opts.invoiceEnabled) {
    return new Promise((resolve) => { resolve([]) })
  }

  return new Promise((resolve) => {

    const walletsHashMap = {}
    const wallets = data.map((item) => {
      if (item && item.type && item.address) {
        const {
          type: rawType,
          tokenKey,
          address,
        } = item

        const type = ((tokenKey) ? tokenKey : getCurrencyKey(rawType, true)).toUpperCase()
        walletsHashMap[`${type}:${address.toLowerCase()}`] = {
          type,
          address,
        }

        return {
          type,
          address,
        }
      }
    })

    apiLooper.post('invoiceApi', `/invoice/fetchmany/`, {
      body: {
        wallets,
        mainnet: (process.env.MAINNET) ? '1' : '0',
      },
    }).then((res: any) => {
      if (res && res.answer && res.answer === 'ok') {
        const invoices = res.items.map((item) => {
          const walletHash = `${item.type}:${item.toAddress.toLowerCase()}`

          const direction = (walletsHashMap[walletHash] !== undefined) ? 'in' : 'out'

          return ({
            type: item.type,
            txType: 'INVOICE',
            invoiceData: item,
            hash: 'no hash',
            confirmations: 1,
            value: item.amount,
            date: item.utx * 1000,
            direction,
          })
        })

        resolve(invoices)
      } else {
        resolve([])
      }
    })
      .catch(() => {
        resolve([])
      })
  })
}

const getInvoices = (data) => {
  if (!config.opts.invoiceEnabled) {
    return new Promise((resolve) => { resolve([]) })
  }

  if (data.address === 'Not jointed') {
    return new Promise((resolve) => {
      resolve([])
    })
  }

  const { user: { btcData } } = getState()
  if (!data || !data.currency || !data.address) return false

  return new Promise((resolve) => {

    apiLooper.post('invoiceApi', `/invoice/fetch/`, {
      body: {
        currency: getCurrencyKey(data.currency, true).toUpperCase(),
        address: data.address,
        mainnet: (process.env.MAINNET) ? '1' : '0',
      },
    }).then((res: any) => {
      if (res && res.answer && res.answer === 'ok') {
        const transactions = res.items.map((item) => {
          const direction = item.toAddress === data.address ? 'in' : 'out'

          return ({
            type: getCurrencyKey(data.currency, true),
            txType: 'INVOICE',
            invoiceData: item,
            hash: 'no hash',
            confirmations: 1,
            value: item.amount,
            date: item.utx * 1000,
            direction,
          })
        })

        resolve(transactions)
      } else {
        resolve([])
      }
    })
      .catch(() => {
        resolve([])
      })
  })
}

export default {
  addInvoice,
  getInvoices,
  getInvoice,
  getManyInvoices,
  cancelInvoice,
  markInvoice,
}

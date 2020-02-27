import config from 'app-config'
import actions from 'redux/actions'
import reducers from 'redux/core/reducers'
import { getState } from 'redux/core'
const pullTransactions = transactions => {
  let data = [].concat([], ...transactions).sort((a, b) => b.date - a.date)
  reducers.history.setTransactions(data)
}

const delay = (ms) => new Promise(resolve => setTimeout(() => resolve(true), ms))

const setTransactions = async (address) => {
  try {
    const mainTokens = await Promise.all([
      actions.btc.getTransaction(address),
      // actions.btc.getInvoices(),
      actions.eth.getTransaction(address),
      // actions.btcmultisig.getTransactionSMS(address),
      // actions.btcmultisig.getInvoicesSMS(),
      // actions.btcmultisig.getTransactionUser(address),
      // actions.btcmultisig.getInvoicesUser(),
      // actions.bch.getTransaction(address),
      // # pernament actions.usdt.getTransaction(),
    
      // actions.eth.getInvoices(),
      // actions.ltc.getTransaction(address),
    ])

    await new Promise(async resolve => {
      const ercArray = await Promise.all(Object.keys(config.erc20)
        .map(async (name, index) => {
          await delay(650 * index)
          const res = await actions.token.getTransaction(name)
          // console.log('name - ', name, '\n', '\n', res)
          return res
        }))
      return resolve(ercArray)
    }).then((ercTokens) => {
      pullTransactions([...mainTokens, ...ercTokens])
    })
  } catch (error) {
    console.error('getTransError: ', error)
  }
}


export default {
  setTransactions
}

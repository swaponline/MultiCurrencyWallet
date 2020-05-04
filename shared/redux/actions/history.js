import config from 'app-config'
import actions from 'redux/actions'
import reducers from 'redux/core/reducers'
import { getState } from 'redux/core'
import getCurrencyKey from 'helpers/getCurrencyKey'


const pullTransactions = transactions => {
  let data = [].concat([], ...transactions).sort((a, b) => b.date - a.date)
  reducers.history.setTransactions(data)
}

const delay = (ms) => new Promise(resolve => setTimeout(() => resolve(true), ms))

const setTransactions = async (address, type, callback) => {
  
  let reducer = getCurrencyKey(type)

  type = getCurrencyKey(type, true)

  try {
    const currencyTxs = await Promise.all([
      actions[reducer].getTransaction(address, type),
      (
        (reducer === `btc` && actions.btcmultisig.isBTCMSUserAddress(address)) ?
          actions.multisigTx.fetch(address) :
          new Promise((resolve) => resolve([]))
      ),
      /*
      // Dont show invoices in transaction list.
      // @ToDo - Fetch multisig transactions for confirmations
      (
        (config.opts && config.opts.invoiceEnabled && actions.user.isOwner(address, type)) ? 
          actions.invoices.getInvoices({
            currency: type.toUpperCase(),
            address,
          }) :
          new Promise((resolve) => resolve([]))
      ),
      */
    ])
    if (typeof callback === 'function') {
      callback([...currencyTxs])
    } else {
      pullTransactions([...currencyTxs])
    }
    /*
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
    */
  } catch (error) {
    console.error('getTransError: ', error)
  }
}


export default {
  setTransactions
}

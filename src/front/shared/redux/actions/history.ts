import actions from 'redux/actions'
import reducers from 'redux/core/reducers'
import getCurrencyKey from 'helpers/getCurrencyKey'


const pullTransactions = transactions => {
  //@ts-ignore: strictNullChecks
  let data = [].concat([], ...transactions).sort((a, b) => b.date - a.date)
  reducers.history.setTransactions(data)
}

const setTransactions = async (address, type, callback) => {
  let reducer = getCurrencyKey(type, false)

  type = getCurrencyKey(type, true)

  try {
    const currencyTxs = await Promise.all([
      actions[reducer].getTransaction(address, type),
      (
        (reducer === `btc` && actions.btcmultisig.isBTCMSUserAddress(address)) ?
          actions.multisigTx.fetch(address) :
          new Promise((resolve) => resolve([]))
      ),
    ])
    if (typeof callback === 'function') {
      callback([...currencyTxs])
    } else {
      pullTransactions([...currencyTxs])
    }
  } catch (error) {
    console.error('getTransError: ', error)
  }
}


export default {
  setTransactions,
}

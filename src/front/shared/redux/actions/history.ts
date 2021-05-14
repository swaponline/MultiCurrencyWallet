import actions from 'redux/actions'
import reducers from 'redux/core/reducers'
import getCurrencyKey from 'helpers/getCurrencyKey'
import erc20Like from 'common/erc20Like'

const pullTransactions = (transactions) => {
  let data = [...transactions].sort((a, b) => b.date - a.date)

  reducers.history.setTransactions(data)
}

const setTransactions = async (address, type, callback) => {
  let actionName = getCurrencyKey(type, false)
  const isErc20Token = erc20Like.erc20.isToken({ name: type })
  const isBep20Token = erc20Like.bep20.isToken({ name: type })
  const currencyName = getCurrencyKey(type, true)
  const isMultisigBtcAddress = actionName === 'btc' && actions.btcmultisig.isBTCMSUserAddress(address)
  
  if (isErc20Token) {
    actionName = 'erc20'
  } else if (isBep20Token) {
    actionName = 'bep20'
  }

  try {
    const currencyTxs = await Promise.all([
      actions[actionName].getTransaction(address, currencyName),
      isMultisigBtcAddress ? actions.multisigTx.fetch(address) : new Promise((resolve) => resolve([])),
    ])
    if (typeof callback === 'function') {
      callback([...currencyTxs])
    } else {
      pullTransactions([...currencyTxs])
    }
  } catch (error) {
    console.group('Actions >%c history', 'color: red;')
    console.error('setTransactions: ', error)
    console.groupEnd()
  }
}

export default {
  setTransactions,
}

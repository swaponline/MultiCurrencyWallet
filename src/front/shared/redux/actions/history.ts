import actions from 'redux/actions'
import reducers from 'redux/core/reducers'
import erc20Like from 'common/erc20Like'

import { COIN_DATA } from 'swap.app/constants/COINS'

const pullTransactions = (transactions) => {
  let data = [...transactions].sort((a, b) => b.date - a.date)

  reducers.history.setTransactions(data)
}

const setTransactions = async (address, type, callback) => {
  let actionName

  if (erc20Like.isToken({name: type})) {
    const tokenStandard = COIN_DATA[type.toUpperCase()].standard.toLowerCase()
    actionName = tokenStandard
  } else {
    actionName = type
  }

  const isMultisigBtcAddress = actionName === 'btc' && actions.btcmultisig.isBTCMSUserAddress(address)

  try {
    const currencyTxs = await Promise.all([
      actions[actionName].getTransaction(address, type),
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

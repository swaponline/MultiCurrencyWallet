import actions from 'redux/actions'
import reducers from 'redux/core/reducers'
import erc20Like from 'common/erc20Like'

import { COIN_DATA } from 'swap.app/constants/COINS'

const pullTransactions = (transactions) => {
  const sortedTxs = transactions.sort((a, b) => b.date - a.date)

  reducers.history.setTransactions(sortedTxs)
}

const setTransactions = async (address, name) => {
  let actionName

  switch (name) {
    case 'btc (sms-protected)':
    case 'btc (multisig)':
    case 'btc (pin-protected)':
      name = 'btc'
  }

  if (erc20Like.isToken({ name })) {
    const tokenStandard = COIN_DATA[name.toUpperCase()].standard.toLowerCase()
    actionName = tokenStandard
  } else {
    actionName = name
  }

  const isMultisigBtcAddress = actionName === 'btc' && actions.btcmultisig.isBTCMSUserAddress(address)

  try {
    const result: [][] = await Promise.all([
      actions[actionName].getTransaction(address, name),
      isMultisigBtcAddress ? actions.multisigTx.fetch(address) : new Promise((resolve) => resolve([])),
    ])
    const transactions = [].concat(...result)

    pullTransactions([...transactions])
  } catch (error) {
    console.group('Actions >%c history', 'color: red;')
    console.error('setTransactions: ', error)
    console.groupEnd()
  }
}

export default {
  pullTransactions,
  setTransactions,
}

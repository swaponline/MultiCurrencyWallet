import actions from 'redux/actions'
import reducers from 'redux/core/reducers'
import erc20Like from 'common/erc20Like'

import { COIN_DATA } from 'swap.app/constants/COINS'

const pullTransactions = (transactions) => {
  const sortedTxs = transactions.sort((a, b) => b.date - a.date)
  const filteredTxs: IUniversalObj[] = []

  for (let i = 0; i < sortedTxs.length - 1; i += 1) {
    if (sortedTxs[i].hash !== sortedTxs[i + 1].hash) {
      filteredTxs.push(sortedTxs[i])
    }
  }

  reducers.history.setTransactions(filteredTxs)
}

const setTransactions = async (address, type) => {
  let actionName

  if (erc20Like.isToken({name: type})) {
    const tokenStandard = COIN_DATA[type.toUpperCase()].standard.toLowerCase()
    actionName = tokenStandard
  } else {
    actionName = type
  }

  const isMultisigBtcAddress = actionName === 'btc' && actions.btcmultisig.isBTCMSUserAddress(address)

  try {
    const result: [][] = await Promise.all([
      actions[actionName].getTransaction(address, type),
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

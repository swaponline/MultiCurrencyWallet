import debug from 'debug'

import history from './history'
import swap from './swap'

export const hash2id = (hash) =>
  new Promise(async resolve => {
    const swapHisory = history.getAll()

    swapHisory.forEach(swapID => {
      const currentSwap = swap.get(swapID)
      const flowState = currentSwap.flow.state
      const currency = currentSwap.flow._flowName.split('2')[0].toLowerCase()
      let currentHash = null

      switch (currency) {
        case 'btc':
          currentHash = flowState.btcScriptCreatingTransactionHash
          break
        case 'eth':
          currentHash = flowState.ethSwapCreationTransactionHash
          break
      }

      if (currentHash && currentHash === hash) {
        resolve(currentSwap.id)
      }
    })
    debug('swap.core:simple:swap')('This swap is not found or does not need to be refunded')
    resolve(null)
  })

export const secret2id = (secret) =>
  new Promise(async resolve => {
    const swapHisory = history.getAll()

    swapHisory.forEach(swapID => {
      const currentSwap = swap.get(swapID)
      const currentSecret = currentSwap.flow.state.secret

      if (currentSecret && currentSecret === secret) {
        resolve(currentSwap.id)
      }
    })
    debug('swap.core:simple:swap')('This swap is not found or does not need to be refunded')
    resolve(null)
  })

module.exports = { hash2id, secret2id }

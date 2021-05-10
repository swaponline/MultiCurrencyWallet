import debug from 'debug'

import history from './history'
import * as swap from './swap'

export const hash2id = (app, hash) =>
  new Promise(async resolve => {
    const swapHisory = history.getAll()

    swapHisory.forEach(swapID => {
      const currentSwap = swap.get(app, swapID)
      const flowState = currentSwap.flow.state
      const currency = currentSwap.flow._flowName.split('2')[0].toLowerCase()
      let currentHash = null

      switch (currency) {
        case 'btc':
          //@ts-ignore: strictNullChecks
          currentHash = flowState.utxoScriptCreatingTransactionHash
          break
        case 'eth':
          //@ts-ignore: strictNullChecks
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

export const secret2id = (app, secret) =>
  new Promise(async resolve => {
    const swapHisory = history.getAll()

    swapHisory.forEach(swapID => {
      const currentSwap = swap.get(app, swapID)
      const currentSecret = currentSwap.flow.state.secret

      if (currentSecret && currentSecret === secret) {
        resolve(currentSwap.id)
      }
    })
    debug('swap.core:simple:swap')('This swap is not found or does not need to be refunded')
    resolve(null)
  })

export default { hash2id, secret2id }

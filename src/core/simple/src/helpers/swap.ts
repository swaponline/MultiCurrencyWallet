import { constants } from 'swap.app'
import Swap from 'swap.swap'
import debug from 'debug'

import crypto from 'crypto'
import history from './history'
import { on } from './on'

export const read = Swap.read

export const get = (app, id?) => new Swap(id, app)

export const onStep = (swap, _step) => new Promise(async resolve => {
  if (_step <= swap.flow.state.step)
    resolve(swap.flow.state.step)

  debug('swap.core:simple:swap')('begin waiting step =', _step, 'on', swap.id)

  const enterStep = step => {
    debug('swap.core:simple:swap')('waiting for', _step, 'now on', step)

    if (step === _step) {
      resolve(step)

      swap.off('enter step', enterStep)
    }
  }

  swap.on('enter step', enterStep)
})

export const generateSecret = () => crypto.randomBytes(32).toString('hex')

export const start = (swap) =>
  new Promise(async resolve => {
    switch (swap.flow._flowName) {
      case "BTC2ETH":
        await onStep(swap, 2)

        const secret = generateSecret()
        swap.flow.submitSecret(secret)

        break;
      case "ETH2BTC":
        await onStep(swap, 1)
        swap.flow.sign()

        await onStep(swap, 3)
        swap.flow.verifyBtcScript()
        break;
    }
    resolve()
  })

export const refund = (app, swapID) =>
  new Promise(async resolve => {
    debug('swap.core:simple:swap')('Swap id =', swapID)
    const swap = get(app, swapID)

    if (swap.flow.state.isRefunded) {
      debug('swap.core:simple:swap')('This swap is refunded')
      resolve(true)
    } else {
      debug('swap.core:simple:swap')('Refunding...')

      try {
        await swap.flow.tryRefund()
      } catch (error) {
        debug('swap.core:simple:swap')('Can not refund this swap. Try it later')
        swap.flow.state.isRefunded = false
      }

      if (swap.flow.state.isRefunded) {
        debug('swap.core:simple:swap')('This swap is refunded')
        resolve(true)
      }
      resolve(false)
    }
  })

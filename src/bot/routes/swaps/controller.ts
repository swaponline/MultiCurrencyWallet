import crypto from 'crypto'

import { helpers } from 'simple.swap.core'

import { app } from '../../swapApp'
import { findSwap, swapView, decodeFlow, removeSwap } from '../../helpers'
import Pair from '../../microbot/Pair'

import * as flows from 'swap.flows'
import { default as Swap } from 'swap.swap'


//const Orders = app.services.orders

const history = helpers.history

const genSecret = () => crypto.randomBytes(32).toString('hex')

history.init(app)

const until = (_step, swap) =>
  new Promise(resolve => {
    setInterval(
      () => ( swap.flow.state.step >= _step )
        ? resolve(true) : null,
    500)

    swap.on('enter step', (step) => ( step >= _step ) ? resolve(true) : null)
  })

const runSwap = (swap) => {
  console.log(new Date().toISOString(), 'BEGIN', swap.flow._flowName)
  console.log(new Date().toISOString(), 'total steps', swap.flow.steps.length)

  swap.on('enter step', (step) => {
    console.log('enter step', step)

    if ( step + 1 === swap.flow.steps.length ) {
      console.log(new Date().toISOString(), '[FINISHED] tx', swap.flow.state.ethSwapWithdrawTransactionHash)
    }
  })
}

const getSwapFormated = (req, res) => {
  findSwap(app)(req, res).then((swap) => {
    res.send(`<pre>${JSON.stringify(swapView(swap), null, '    ')}</pre>`)
  })
}

const getSwap = (req, res) => {
  findSwap(app)(req, res).then((swap) => {
    res.json(swapView(swap))
  })
}

const getState = (req, res) => {
  findSwap(app)(req, res).then((swap) => {
    res.json((swap.flow.state))
  })
}

const goSwap = async (req, res) => {
  const swap = await findSwap(app)(req, res)

  if (swap.flow && swap.flow.state.step)
    return res.json(swapView(swap))

  runSwap(swap)

  res.json(swapView(swap))
}

const withSwap = (swapHandler) => async (req, res) => {
  let swap
  try {
    swap = await findSwap(app)(req, res)
    await swapHandler(swap, req.query)
    res.json(swapView(swap))
  } catch (error) {
    const { code, name, message, stack } = error
    const info = {
      code, name, message,
      step: swap.flow.state.step,
      type: swap.type, swap: swap.id,
      stack,
      state: swap.flow.state,
      error
    }
    console.error(info)
    res.status(500).json(info)
  }
}

const nextStep = async (swap) => {
  const currentStep = swap.flow.state.step
  console.log(new Date().toISOString(), `waiting for step=${currentStep + 1}`)

  await until(currentStep + 1, swap)
}

const sign = async (swap) => {
  // if (swap.flow.state.isMeSigned) throw new Error(`Already signed`)

  await until(1, swap)
  await swap.flow.sign()
  await until(2, swap)
}

const verifyScript = async (swap) => {
  if (swap.flow.state.utxoScriptVerified) throw new Error(`Already verified`)

  await until(3, swap)
  await swap.flow.verifyScript()
  await until(4, swap)
}

const submitSecret = async (swap) => {
  if (swap.flow.state.secret)
    throw new Error(`Already submit ${swap.flow.state.secretHash}`)

  await until(2, swap)
  await swap.flow.submitSecret(genSecret())
  await until(3, swap)
}

const syncBalance = async (swap) => {
  if (swap.flow.state.isBalanceEnough)
    throw new Error(`Already synced ${swap.flow.state.balance}`)

  await until(3, swap)
  await swap.flow.syncBalance()
  await until(4, swap)
}

const tryRefund = async (swap) => {
  try {
    await swap.flow.tryRefund()
  } catch (err) {
    if (err.error == '64: non-final. Code:-26')
      err.message =
        `Can't be mined until lockTime = ${swap.flow.state.utxoScriptValues.lockTime}, now = ${Date.now()/1000}, secondsLeft = ${Math.ceil(swap.flow.state.utxoScriptValues.lockTime - Date.now()/1000)}`

    throw err
  }
}

const refund = (req, res) => {
  findSwap(app)(req, res).then(async (swap) => {
    if (!swap.flow || !swap.flow.state || !swap.flow.state.step)
      return res.status(403).json({ error: 'not started' })

    try {
      const result = await swap.flow.tryRefund()
      res.json({ status: 'refund', result })
    } catch (err) {
      if (err.error == '64: non-final. Code:-26') {
        const { usdtScriptValues, utxoScriptValues } = swap.flow.state
        const scriptValues = usdtScriptValues || utxoScriptValues

        err.description =
          `Can't be mined until lockTime = ${scriptValues.lockTime}, now = ${Date.now()/1000}, secondsLeft = ${Math.ceil(scriptValues.lockTime - Date.now()/1000)}`
      }

      res.status(403).json({
        result: 'refund error',
        description: err.description,
        message: err.message,
        error: err
      })
      throw err
    }
  })
}

const tryWithdraw = async (swap, { secret }) => {
  if (!secret)
    throw new Error(`You need to provide secret for manual withdrawal`)

  await swap.flow.tryWithdraw(secret)
}

const getInProgress = ({ query: { parsed, withFees }}, res) => {
  const swaps = history
    .getAllInProgress()
    .map((id) => {
      try {
        const swapData = new Swap(id, app)
        return swapData
      } catch (e) {
        return false
      }
    })
    .filter((swapData: Swap | boolean) => { return swapData !== false })

  if (!parsed) {
    return res.json(swaps.map(swapView))
  }

  const pairs = swaps.map(swap => {
    const pair = Pair.fromOrder(swap)
    return { id: swap.id, pair, swap: swapView(swap) }
  })

  return res.json(pairs)
}

const getFinished = ({ query: { parsed, withFees }}, res) => {
  const swaps = history
    .getAllFinished()
    .map((id) => {
      try {
        const swapData = new Swap(id, app)
        return swapData
      } catch (e) { return false }
    })
    .filter((swapData: Swap | boolean ) => { return swapData !== false })

  if (!parsed) {
    return res.json(swaps.map(swapView))
  }

  const pairs = swaps.map(swap => {
    try {
      const pair = Pair.fromOrder(swap)
      return { id: swap.id, pair, swap: swapView(swap) }
    } catch (e) {
      return false
    }
  }).filter((pair: any) => { return pair !== false })

  return res.json(pairs)
}

export {
  getSwap,
  getSwapFormated,

  getState,
  goSwap,
  refund,

  nextStep,
  withSwap,
  sign,
  submitSecret,
  verifyScript,
  syncBalance,
  tryWithdraw,

  getInProgress,
  getFinished,
}

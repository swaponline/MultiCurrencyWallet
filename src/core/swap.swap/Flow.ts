import debug from 'debug'
import SwapApp from 'swap.app'
import Room from './Room'


class Flow {

  swap: any
  steps: any
  app: any
  stepNumbers: any
  state: {
    // Common swaps state
    step: number
    isWaitingForOwner: boolean

    isStoppedSwap?: boolean
    isRefunded?: boolean
    isFinished?: boolean

    // Torbo swaps state
    // ...

    // Atomic swaps state
    // -- AB-UTXO
    particalHasLockedUTXO?: boolean
    // -- UTXO-AB
    isUTXOScriptOk?: boolean
    waitUnlockUTXO?: boolean
  }

  constructor(swap) {
    this.swap     = swap
    this.steps    = []
    this.app      = null

    this.stepNumbers = {}

    this.state = {
      step: 0,
      isWaitingForOwner: false,
      isStoppedSwap: false,

      /** -------------- Turbo Swaps States ----------------- **/
      // ....

      /** -------------- Atomic Swaps States ---------------- **/
      ...{
        /** AB-UTXO **/
        // Partical (btc-seller) has unconfirmed txs in mempool
        particalHasLockedUTXO: false,
        // Script charged, confirmed and checked - next step - charge AB contract
        isUTXOScriptOk: false,
      },
      ...{
        /** UTXO-AB **/
        // We are have locked txs in mem-pool
        waitUnlockUTXO: false,
      },
      ...{
        /** UTXO-UTXO **/
      },
      ...{
        /** AB-AB **/
      },
    }

    this._attachSwapApp(swap.app)
  }

  _attachSwapApp(app) {
    SwapApp.required(app)

    this.app = app
  }

  static read(app, { id }) {
    SwapApp.required(app)

    if (!id) {
      debug('swap.core:swap')(`FlowReadError: id not given: ${id}`)
      return {}
    }

    return app.env.storage.getItem(`flow.${id}`)
  }

  _isFinished() {
    const {
      isStoppedSwap,
      isRefunded,
      isFinished,
    } = this.state

    return (isStoppedSwap || isRefunded || isFinished)
  }

  _persistState() {
    const state = Flow.read(this.app, this.swap)

    if (state) {
      this.state = {
        ...this.state,
        ...state,
      }
    }

    this.swap.room.on('persist state', (values) => {
      this.setState(values, true)
    })
  }

  _persistSteps() {
    this.steps = [
      ...this._getInitialSteps(),
      ...this._getSteps(),
    ]

    // wait events placed
    setTimeout(() => {
      if ((this.state.step >= this.steps.length)
        || this._isFinished()
      ) return
      else this.goStep(this.state.step)
    }, 0)
  }

  _getInitialSteps() {
    const flow = this

    return [

      // Check if order exists

      async () => {
        const { id: orderId, owner } = this.swap

        // TODO how can we don't know who is participant???
        // TODO if there is no participant in `order` then no need to create Flow...
        // if there is no order it orderCollection that means owner is offline, so `swap.owner` will be undefined
        if (!owner) {
          flow.setState({
            isWaitingForOwner: true,
          })

          this.app.services.room.on('new orders', function ({ orders }) {
            const order = orders.find(({ id }) => id === orderId)

            if (order) {
              this.unsubscribe()

              const order = orders.getByKey(orderId)

              // TODO move this to Swap.js
              //@ts-ignore
              flow.swap.room = new Room({
                participantPeer: order.owner.peer,
              })
              flow.swap.update({
                ...order,
                participant: order.owner,
              })
              flow.finishStep({
                isWaitingForOwner: false,
              })
            }
          })
        }
        else {
          flow.finishStep()
        }
      },
    ]
  }

  _getSteps() {
    return []
  }

  _saveState() {
    this.app.env.storage.setItem(`flow.${this.swap.id}`, this.state)
  }
  finishStep(data?, constraints?) {
    debug('swap.core:swap')(`on step ${this.state.step}, constraints =`, constraints)

    if (constraints) {
      const { step, silentError } = constraints

      const n_step = this.stepNumbers[step]
      debug('swap.core:swap')(`trying to finish step ${step} = ${n_step} when on step ${this.state.step}`)

      if (step && this.state.step != n_step) {
        if (silentError) {
          console.error(`Cant finish step ${step} = ${n_step} when on step ${this.state.step}`)
          return
        } else {
          throw new Error(`Cant finish step ${step} = ${n_step} when on step ${this.state.step}`)
          return
        }
      }
    }

    debug('swap.core:swap')(`proceed to step ${this.state.step+1}, data=`, data)

    this.goNextStep(data)
  }

  goNextStep(data) {
    const { step } = this.state
    const newStep = step + 1
    console.warn("this.state", this.state)
    this.swap.events.dispatch('leave step', step)

    this.setState({
      step: newStep,
      ...(data || {}),
    }, true)

    if (this.steps.length > newStep)
      this.goStep(newStep)
  }

  goStep(index) {
    this.swap.events.dispatch('enter step', index)
    this.steps[index]()
  }

  setState(values, save?) {
    this.state = {
      ...this.state,
      ...values,
    }

    if (save) {
      this._saveState()
    }

    this.swap.events.dispatch('state update', this.state, values)
  }

  sendMessageAboutClose() {
    this.swap.room.sendMessage({
      event: 'swap was canceled',// for front
    })

    this.swap.room.sendMessage({
      event: 'swap was canceled for core',
    })
    console.warn(`swap ${this.swap.id} was stoped`)
  }
}


export default Flow

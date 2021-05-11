import debug from 'debug'
import SwapApp, { util } from 'swap.app'
import Room from './Room'
import Swap from './Swap'


class Flow {
  _flowName: string
  swap: Swap
  steps: Function[]
  app: SwapApp
  stepNumbers: any
  isTakerMakerModel: boolean = false

  state: {
    // Common swaps state
    step: number
    isWaitingForOwner?: boolean

    isStoppedSwap?: boolean
    isRefunded?: boolean
    isFinished: boolean
    isSwapTimeout?: boolean

    isSignFetching?: boolean
    isMeSigned?: boolean

    isBalanceFetching: boolean,
    isBalanceEnough: boolean,

    // Turbo swaps state

    takerTxHash?: null | string
    isTakerTxPended?: boolean

    makerTxHash?: null | string
    isMakerTxPended?: boolean

    // Atomic swaps state
    // -- AB-UTXO
    participantHasLockedUTXO?: boolean
    secretHash?: string
    requireWithdrawFee?: boolean
    requireWithdrawFeeSended?: boolean
    // -- UTXO-AB
    isUTXOScriptOk?: boolean
    waitUnlockUTXO?: boolean
    withdrawRequestAccepted?: boolean

    utxoFundError?: string

    // --- UTXO-AB/AB-UTXO equals states
    utxoScriptValues?: any
    utxoScriptVerified?: boolean
    utxoScriptCreatingTransactionHash?: string
    ethSwapCreationTransactionHash?: string

    secret?: string
    isParticipantSigned?: boolean
    scriptAddress?: string
    scriptBalance?: number
    isEthContractFunded?: boolean
  }

  constructor(swap) {
    this.swap     = swap
    this.steps    = []
    //@ts-ignore: strictNullChecks
    this.app      = null

    this.stepNumbers = {}

    //@ts-ignore: strictNullChecks
    this.state = {
      step: 0,
      isWaitingForOwner: false,
      isStoppedSwap: false,
      isSwapTimeout: false,
      isRefunded: false,
      isFinished: false,

      isSignFetching: false,
      isMeSigned: false,

      /** -------------- Turbo Swaps States ----------------- **/

      isBalanceFetching: false,
      isBalanceEnough: true,

      /** -------------- Atomic Swaps States ---------------- **/
      ...{
        /** AB-UTXO **/
        // Partical (btc-seller) has unconfirmed txs in mempool
        participantHasLockedUTXO: false,
        // Script charged, confirmed and checked - next step - charge AB contract
        isUTXOScriptOk: false,
        utxoScriptValues: null,
        utxoScriptVerified: false,
        utxoScriptCreatingTransactionHash: null,
        ethSwapCreationTransactionHash: null,
      },
      ...{
        /** UTXO-AB **/
        // We are have locked txs in mem-pool
        waitUnlockUTXO: false,
        utxoFundError: null,
        utxoScriptValues: null,
        utxoScriptVerified: false,
        utxoScriptCreatingTransactionHash: null,
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

  isTaker(): boolean {
    return !this.isMaker()
  }

  isMaker(): boolean {
    return this.swap.isMy
  }

  _attachSwapApp(app: SwapApp) {
    SwapApp.required(app)

    this.app = app
  }

  static read(app: SwapApp, { id }) {
    SwapApp.required(app)

    if (!id) {
      debug('swap.core:swap')(`FlowReadError: id not given: ${id}`)
      return {}
    }

    return app.env.storage.getItem(`flow.${id}`)
  }

  _isFinished(): boolean {
    const {
      isStoppedSwap,
      isRefunded,
      isFinished,
      isSwapTimeout,
    } = this.state

    if (this.swap.checkTimeout(3600)) {
      this.setState({
        isStoppedSwap: true,
        isSwapTimeout: true,
      }, true)
    }

    return (isStoppedSwap || isRefunded || isFinished || this.swap.checkTimeout(3600))
  }

  isFinished(): boolean {
    return (
      (this.state.step >= this.steps.length)
      || this._isFinished()
    )
  }

  _persistState() {
    const state = Flow.read(this.app, this.swap)

    if (state) {
      this.state = {
        ...this.state,
        ...state,
      }
    }
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
      ) {
        return
      } else {
        this._goStep(this.state.step)
      }
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
        if (owner) {
          flow.finishStep()
        }

        flow.setState({
          isWaitingForOwner: true,
        })

        //@ts-ignore: strictNullChecks
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
    const {
      isStoppedSwap,
    } = this.state


    debug('swap.core:swap')(`on step ${this.state.step}, constraints =`, constraints)

    if (constraints) {
      const { step, silentError } = constraints

      const n_step = this.stepNumbers[step]
      if (isStoppedSwap) {
        console.error(`Cant finish step ${step} = ${n_step} when swap is stopped`)
        return
      }
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

    this._goNextStep(data)
  }

  _goNextStep(data) {
    const {
      step,
      isStoppedSwap,
    } = this.state

    if (isStoppedSwap) return
    const newStep = step + 1
    console.warn("this.state", this.state)
    this.swap.events.dispatch('leave step', step)

    this.setState({
      step: newStep,
      ...(data || {}),
    }, true)

    if (this.steps.length > newStep)
      this._goStep(newStep)
  }

  _goStep(index) {
    const {
      isStoppedSwap,
    } = this.state

    if (isStoppedSwap) return

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

  stopSwapProcess() {
    console.warn('Swap was stopped')

    this.setState({
      isStoppedSwap: true,
    }, true)
  }

  tryRefund(): Promise<any> {
    return new Promise((resolve) => { resolve(true) })
  }

}


export default Flow
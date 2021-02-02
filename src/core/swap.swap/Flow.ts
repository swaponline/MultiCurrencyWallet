import debug from 'debug'
import SwapApp, { util } from 'swap.app'
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
    isSwapTimeout?: boolean

    // Torbo swaps state
    // ...

    // Atomic swaps state
    // -- AB-UTXO
    participantHasLockedUTXO?: boolean
    secretHash?: string
    // -- UTXO-AB
    isUTXOScriptOk?: boolean
    waitUnlockUTXO?: boolean

    utxoFundError?: string

    utxoScriptValues: any
    utxoScriptVerified: boolean
    utxoScriptCreatingTransactionHash: string
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
      isSwapTimeout: false,
      isRefunded: false,
      isFinished: false,
      /** -------------- Turbo Swaps States ----------------- **/
      // ....

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


  async waitUTXOScriptFunded({
    utxoCoin,
  }: {
    utxoCoin: string,
  }) {
    const flow = this
    const {
      participant,
      buyAmount,
      sellAmount,
      waitConfirm,
    } = flow.swap

    const { secretHash } = this.state

    const utcNow = () => Math.floor(Date.now() / 1000)

    const isUTXOScriptOk = await util.helpers.repeatAsyncUntilResult(async (stopRepeat) => {
      const {
        utxoScriptValues,
      } = flow.state


      const scriptCheckError = await this[`${utxoCoin}Swap`].checkScript(utxoScriptValues, {
        value: buyAmount,
        recipientPublicKey: this.app.services.auth.accounts[utxoCoin].getPublicKey(),
        lockTime: utcNow(),
        confidence: 0.8,
        isWhiteList: this.app.isWhitelistBtc(participant.btc.address), // @todo - may be need more white list coins
        waitConfirm,
      })

      if (scriptCheckError) {
        if (/Expected script lockTime/.test(scriptCheckError)) {
          console.error(`${utxoCoin} script check error: ${utxoCoin} was refunded`, scriptCheckError)
          flow.stopSwapProcess()
          stopRepeat()
        } else if (/Expected script value/.test(scriptCheckError)) {
          console.warn(`${utxoCoin} script check: waiting balance`)
        } else if (
          /Can be replace by fee. Wait confirm/.test(scriptCheckError)
          ||
          /Wait confirm tx/.test(scriptCheckError)
        ) {
          flow.swap.room.sendMessage({
            event: `wait ${utxoCoin} confirm`,
            data: {},
          })
        } else {
          this.swap.events.dispatch(`${utxoCoin} script check error`, scriptCheckError)
        }

        return false
      } else {
        return true
      }
    })

    if (!isUTXOScriptOk) {
      return false
    } else {
      flow.setState({
        isUTXOScriptOk,
      }, true)
      return true
    }
  }

  stopSwapProcess() {
    console.warn('Swap was stopped')

    this.setState({
      isStoppedSwap: true,
    }, true)
  }

  getScriptValues() {
    return this.state.utxoScriptValues
  }

  verifyScript() {
    const { utxoScriptVerified, utxoScriptValues } = this.state

    if (utxoScriptVerified) {
      return true
    }

    if (!utxoScriptValues) {
      throw new Error(`No script, cannot verify`)
    }

    this.finishStep({
      utxoScriptVerified: true,
    }, { step: 'verify-script' })

    return true
  }

  getScriptCreateTx() {
    const {
      utxoScriptCreatingTransactionHash,
    } = this.state
    return utxoScriptCreatingTransactionHash
  }
}


export default Flow

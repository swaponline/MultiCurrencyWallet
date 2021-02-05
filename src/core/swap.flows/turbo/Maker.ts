import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { Flow } from 'swap.swap'
import { BigNumber } from 'bignumber.js'


export default class TurboMaker extends Flow {
  /* former BTC2ETH */

  _flowName: string
  ethSwap: any
  btcSwap: any
  state: any

  static getName() {
    return 'TurboMaker'
  }

  constructor(swap) {
    super(swap)

    this._flowName = 'TurboMaker'

    this.stepNumbers = {
      'sign': 1,
      'check-balance': 2,
      'wait-taker-tx': 3,
      'send-to-taker': 4,
      'finish': 5,
      'end': 6,
    }

    this.ethSwap = swap.ownerSwap
    this.btcSwap = swap.participantSwap

    if (!this.ethSwap) {
      throw new Error('BTC2ETH: "ethSwap" of type object required')
    }
    if (!this.btcSwap) {
      throw new Error('BTC2ETH: "btcSwap" of type object required')
    }

    this.state = {
      step: 0,

      isStoppedSwap: false,

      isParticipantSigned: false,

      isBalanceFetching: false,
      isBalanceEnough: true,

      isFinished: false,
      isSwapExist: false,
    }

    super._persistState()
    super._persistSteps()
  }

  _getSteps() {
    const flow = this

    return [

      // 1. 'sign'

      async () => {
        //flow.swap.processMetamask()
        flow.swap.room.once('swap sign', () => {
          const { step } = flow.state

          if (step >= 2) {
            return
          }

          flow.finishStep({
            isParticipantSigned: true,
          }, { step: 'sign', silentError: true })
        })

        flow.swap.room.once('swap exists', () => {
          flow.setState({
            isSwapExist: true,
          })

          flow.stopSwapProcess()
        })

        flow.swap.room.sendMessage({
          event: 'request sign',
        })
      },

      // 2. 'check-balance'

      async () => {

        // raised

        const { sellAmount } = this.swap

        this.setState({
          isBalanceFetching: true,
        })

        const btcAddress = this.app.services.auth.accounts.btc.getAddress()

        const txFee = await this.btcSwap.estimateFeeValue({
          method: 'swap',
          fixed: true,
          address: btcAddress
        })

        const unspents = await this.btcSwap.fetchUnspents(btcAddress)
        const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
        const balance = new BigNumber(totalUnspent).dividedBy(1e8)

        const needAmount = sellAmount.plus(txFee)
        const isEnoughMoney = needAmount.isLessThanOrEqualTo(balance)

        const stateData = {
          isBalanceFetching: false,
          isBalanceEnough: isEnoughMoney,
        }

        if (isEnoughMoney) {
          this.finishStep(stateData, { step: 'sync-balance' })
        } else {
          this.setState(stateData, true)
        }
      },


      // 3. 'wait-taker-tx'

      () => {

      },

      // 4. 'send-to-taker'

      () => {

      },

      // 5. 'finish'

      () => {
        flow.swap.room.once('swap finished', ({btcSwapWithdrawTransactionHash}) => {
          flow.setState({
            btcSwapWithdrawTransactionHash,
          })
        })

        flow.swap.room.sendMessage({
          event: 'request swap finished',
        })

        flow.finishStep({
          isFinished: true,
        }, 'finish')
      },

      // 6. 'end': Finished!

      () => {}
    ]
  }

  stopSwapProcess() {
    const flow = this

    debug('swap.core:flow')('Swap was stopped')

    flow.setState({
      isStoppedSwap: true,
    }, true)
  }

}

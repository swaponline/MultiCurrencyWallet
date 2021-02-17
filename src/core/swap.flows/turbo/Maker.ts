import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { Flow } from 'swap.swap'
import { BigNumber } from 'bignumber.js'


export default class TurboMaker extends Flow {
  /* former BTC2ETH */

  _flowName = 'TurboMaker'
  static getName = () => 'TurboMaker'

  //ethSwap: any
  //btcSwap: any

  state: {
    step: 0 | 1 | 2 | 3 | 4 | 5 | 6,

    isParticipantSigned: boolean,

    isBalanceFetching: boolean,
    isBalanceEnough: boolean,

    isStoppedSwap: boolean,
    isFinished: boolean,
  }

  constructor(swap) {
    super(swap)
console.log('CONSTRUCTOR swap =', swap)

    this.stepNumbers = {
      'sign': 1,
      'check-balance': 2,
      'wait-taker-tx': 3,
      'send-to-taker': 4,
      'finish': 5,
      'end': 6,
    }

    //this.ethSwap = swap.ownerSwap
    //this.btcSwap = swap.participantSwap

    this.state = {
      step: 0,

      isParticipantSigned: false,

      isBalanceFetching: false,
      isBalanceEnough: true,

      isStoppedSwap: false,
      isFinished: false,
    }

    super._persistState()
    super._persistSteps()
  }

  _getSteps() {
    const flow = this
    const swap = this.swap
    const room = this.swap.room

    return [

      // 1. 'sign'

      async () => {
        console.log('ENTER Maker flow')
        console.log('step 1')
        console.log('this.swap =', swap)

        //flow.swap.processMetamask()

        room.sendMessage({
          event: 'request sign',
        })

        room.once('swap sign', () => {
          const { step } = flow.state

          if (step >= 2) {
            return
          }

          flow.finishStep({
            isParticipantSigned: true,
          }, { step: 'sign' })
        })
      },

      // 2. 'check-balance'

      async () => {
        console.log('step 2')
        console.log('this.swap =', swap)
        /*const { sellAmount } = this.swap

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
          this.finishStep(stateData, { step: 'check-balance' })
        } else {
          this.setState(stateData, true)
        }*/
        return true
      },


      // 3. 'wait-taker-tx'

      () => {

      },

      // 4. 'send-to-taker'

      () => {

      },

      // 5. 'finish'

      () => {
        /*room.once('swap finished', ({btcSwapWithdrawTransactionHash}) => {
          flow.setState({
            btcSwapWithdrawTransactionHash,
          })
        })

        room.sendMessage({
          event: 'request swap finished',
        })

        flow.finishStep({
          isFinished: true,
        }, 'finish')*/
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

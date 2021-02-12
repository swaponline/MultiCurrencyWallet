import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { Flow } from 'swap.swap'


export default class TurboTaker extends Flow {
  /* former ETH2BTC */

  _flowName = 'TurboTaker'
  static getName = () => 'TurboTaker'

  //ethSwap: any
  //btcSwap: any

  state: {
    step: 0 | 1 | 2 | 3 | 4 | 5 | 6,

    isSignFetching: boolean,
    isMeSigned: boolean,

    isBalanceFetching: boolean,
    isBalanceEnough: boolean,

    isStoppedSwap: boolean,
    isFinished: boolean,
  }

  constructor(swap) {
    super(swap)

    this.stepNumbers = {
      'sign': 1,
      'check-balance': 2,
      'send-to-maker': 3,
      'wait-maker-tx': 4,
      'finish': 5,
      'end': 6
    }

    //this.ethSwap = swap.participantSwap
    //this.btcSwap = swap.ownerSwap

    /*if (!this.ethSwap) {
      throw new Error('BTC2ETH: "ethSwap" of type object required')
    }
    if (!this.btcSwap) {
      throw new Error('BTC2ETH: "btcSwap" of type object required')
    }*/

    this.state = {
      step: 0,

      isSignFetching: false,
      isMeSigned: false,

      isBalanceFetching: false,
      isBalanceEnough: true,

      isStoppedSwap: false,
      isFinished: false,
    }

    const flow = this
    const room = flow.swap.room

    room.once('request withdraw', () => {
      flow.setState({
        withdrawRequestIncoming: true,
      })
    })

    super._persistState()
    super._persistSteps()
  }

  _getSteps() {
    const flow = this
    const room = flow.swap.room

    return [

      // 1. 'sign'

      async () => {
        console.log('ENTER Taker flow')
        console.log('step 1')
        console.log('this.swap =', this.swap)

        //flow.swap.processMetamask()

        const { isSignFetching, isMeSigned } = flow.state

        if (isSignFetching || isMeSigned) {
          return true
        }

        flow.setState({
          isSignFetching: true,
        })

        room.on('request sign', () => {
          room.sendMessage({
            event: 'swap sign',
          })
        })

        room.sendMessage({
          event: 'swap sign',
        })

        flow.finishStep({
          isMeSigned: true,
        }, { step: 'sign' })

        return true
      },

      // 2. 'check-balance'

      async () => {
        console.log('step 2')
        console.log('this.swap =', this.swap)
        /*const { sellAmount } = this.swap

        this.setState({
          isBalanceFetching: true,
        })

        const balance = await this.ethSwap.fetchBalance(
          this.app.getMyEthAddress()
        )
        const isEnoughMoney = sellAmount.isLessThanOrEqualTo(balance)

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

      // 3. 'send-to-maker'

      () => {

      },

      // 4. 'wait-maker-tx'

      () => {
        // draft
        //room.on(Message.Maker, () => {})
      },

      // 5. 'finish'

      () => {
        /*room.once('request swap finished', () => {
          const { btcSwapWithdrawTransactionHash } = flow.state

          room.sendMessage({
            event: 'swap finished',
            data: {
              btcSwapWithdrawTransactionHash,
            },
          })
        })

        flow.finishStep({
          isFinished: true,
        }, { step: 'finish' })*/
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

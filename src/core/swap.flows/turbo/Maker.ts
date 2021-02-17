import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { Flow } from 'swap.swap'
import { BigNumber } from 'bignumber.js'


export default class TurboMaker extends Flow {

  _flowName = 'TurboMaker'
  static getName = () => 'TurboMaker'

  mySwap: any
  participantSwap: any

  state: {
    step: 0 | 1 | 2 | 3 | 4 | 5 | 6,

    isParticipantSigned: boolean,

    isBalanceFetching: boolean,
    isBalanceEnough: boolean,

    takerTxHash: null | string
    makerTxHash: null | string

    isStoppedSwap: boolean,
    isFinished: boolean,
  }

  constructor(swap) {
    super(swap)
    console.log('Create Maker flow(swap), swap =', swap)

    this.stepNumbers = {
      'sign': 1,
      'check-balance': 2,
      'wait-taker-tx': 3,
      'send-maker-tx': 4,
      'finish': 5,
      'end': 6,
    }

    this.mySwap = swap.ownerSwap
    this.participantSwap = swap.participantSwap

    this.state = {
      step: 0,

      isParticipantSigned: false,

      isBalanceFetching: false,
      isBalanceEnough: true,

      takerTxHash: null,
      makerTxHash: null,

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

    const mySwap = this.mySwap
    const participantSwap = this.participantSwap

    return [

      async () => {
        console.log(`Maker Step 1: 'sign'`)
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


      async () => {
        console.log(`Maker Step 2: 'check-balance'`)
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

        //return true

        //temp
        this.finishStep({
          isBalanceEnough: true,
        }, { step: 'check-balance' })
      },


      () => {
        console.log(`Maker Step 3: 'wait-taker-tx'`)
        console.log('this.swap =', swap)

        room.once('taker tx sended', ({ txHash }) => {
          console.log(`RECEIVED from taker: tx hash =`, txHash)
          console.log('Check taker tx...')
          //... || this.stopSwapProcess()
          console.log('Taker tx is OK!')
          
          flow.finishStep({
            takerTxHash: txHash,
          }, { step: 'wait-taker-tx' })
        })
      },


      () => {
        console.log(`Maker Step 4: 'send-maker-tx'`)
        console.log('this.swap =', swap)

        // generate and broadcast tx
        //...

        const txHash = '162b115f974aa8134f1b5327e120e3c4b2bae72c85372a4432fe79119cd828a1'

        room.sendMessage({
          event: 'maker tx sended',
          data: {
            txHash,
          }
        })

        flow.finishStep({
          makerTxHash: txHash,
        }, 'send-maker-tx')
      },


      () => {
        console.log(`Maker Step 5: 'finish'`)
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


      () => {
        console.log(`Maker Step 6: 'end'`)
        // Finished!
      }
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

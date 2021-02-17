import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { Flow } from 'swap.swap'


export default class TurboTaker extends Flow {

  _flowName = 'TurboTaker'
  static getName = () => 'TurboTaker'

  mySwap: any
  participantSwap: any

  state: {
    step: 0 | 1 | 2 | 3 | 4 | 5 | 6,

    isSignFetching: boolean,
    isMeSigned: boolean,

    isBalanceFetching: boolean,
    isBalanceEnough: boolean,

    takerTxHash: null | string
    makerTxHash: null | string

    isStoppedSwap: boolean,
    isFinished: boolean,
  }

  constructor(swap) {
    super(swap)
    console.log('Create Taker flow (swap), =', swap)

    this.stepNumbers = {
      'sign': 1,
      'check-balance': 2,
      'send-taker-tx': 3,
      'wait-maker-tx': 4,
      'finish': 5,
      'end': 6
    }

    this.mySwap = swap.ownerSwap
    this.participantSwap = swap.participantSwap

    this.state = {
      step: 0,

      isSignFetching: false,
      isMeSigned: false,

      isBalanceFetching: false,
      isBalanceEnough: true,

      takerTxHash: null,
      makerTxHash: null,

      isStoppedSwap: false,
      isFinished: false,
    }

    const flow = this
    const room = flow.swap.room

    room.once('request withdraw', () => {
      flow.setState({
        //withdrawRequestIncoming: true,
      })
    })

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
        console.log(`Taker Step 1: 'sign'`)
        console.log('this.swap =', swap)

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


      async () => {
        console.log(`Taker Step 2: 'check-balance'`)
        console.log('this.swap =', swap)

        // just test

        /*const b1 = await mySwap.fetchBalance(swap.participant[swap.buyCurrency.toLowerCase()].address)
        console.log('b1=', b1)

        const b2 = await participantSwap.fetchBalance(swap.participant[swap.sellCurrency.toLowerCase()].address)
        console.log('b2=', b2)*/



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

        //return true

        //temp
        this.finishStep({
          isBalanceEnough: true,
        }, { step: 'check-balance' })
      },


      () => {
        console.log(`Taker Step 3: 'send-taker-tx'`)
        console.log('this.swap =', swap)

        // send tx

        const amount = swap.sellAmount
        const to = swap.participant[swap.sellCurrency.toLowerCase()].address

        console.log(`Send ${amount} ${swap.sellCurrency} to maker address "${to}"...`)

        /*if (mySwap._swapName === 'BTC') {
        }
        if (mySwap._swapName === 'ETH') {

        }*/
        // ...

        const txHash = '1324154f6086b6b137be8763f43096cacd5450f9561da061161638ed68ce39c3'
        
        console.log('Sended! txHash = ')

        room.sendMessage({
          event: 'taker tx sended',
          data: {
            txHash,
          }
        })

        flow.finishStep({
          takerTxHash: txHash,
        }, 'send-taker-tx')
      },


      () => {
        console.log(`Taker Step 4: 'wait-maker-tx'`)
        console.log('this.swap =', swap)

        room.once('maker tx sended', ({ txHash }) => {
          console.log(`RECEIVED from maker: tx hash =`, txHash)
          console.log('Check maker tx...')
          //... || this.stopSwapProcess()
          console.log('Maker tx is OK!')
          
          flow.finishStep({
            makerTxHash: txHash,
          }, { step: 'wait-maker-tx' })
        })
      },


      () => {
        console.log(`Taker Step 5: 'finish'`)
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


      () => {
        console.log(`Taker Step 6: 'end'`)
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
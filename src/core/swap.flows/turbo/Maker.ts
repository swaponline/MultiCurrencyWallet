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
    isTakerTxPended: boolean

    makerTxHash: null | string
    isMakerTxPended: boolean

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
      isTakerTxPended: false,

      makerTxHash: null,
      isMakerTxPended: false,

      isStoppedSwap: false,
      isFinished: false,
    }

    super._persistState()
    super._persistSteps()
  }

  //@ts-ignore: strictNullChecks
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
          // todo: tx check
          //... || this.stopSwapProcess()
          console.log('Taker tx is OK!')

          flow.finishStep({
            takerTxHash: txHash,
            isTakerTxPended: true, // todo later
          }, { step: 'wait-taker-tx' })
        })
      },


      async () => {
        console.log(`Maker Step 4: 'send-maker-tx'`)
        console.log('this.swap =', swap)

        // send tx
        
        const amount = swap.sellAmount
        const to = swap.participant[swap.sellCurrency.toLowerCase()].address

        console.log(`Send ${amount} ${swap.sellCurrency} to taker address "${to}"...`)

        let usedSwap
        if (mySwap._swapName === swap.sellCurrency.toUpperCase()) {
          usedSwap = mySwap
        }
        if (participantSwap._swapName === swap.sellCurrency.toUpperCase()) {
          usedSwap = participantSwap
        }
        if (!usedSwap) {
          throw new Error(`No swap for ${swap.sellCurrency}`)
        } else {
          console.log('Swap found!', usedSwap)
        }

        const txHash = await usedSwap.sendTransaction({ to, amount })

        console.log(`Sended! txHash = ${txHash}`)

        room.sendMessage({
          event: 'maker tx sended',
          data: {
            txHash,
          }
        })

        flow.finishStep({
          makerTxHash: txHash,
          isMakerTxPended: true, // todo later
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
        */
        flow.finishStep({
          isFinished: true,
        }, 'finish')
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

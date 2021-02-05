import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { Flow } from 'swap.swap'


export default class TurboTaker extends Flow {
  /* former ETH2BT */

  _flowName: string
  ethSwap: any
  btcSwap: any
  state: any

  static getName() {
    return 'TurboTaker'
  }

  constructor(swap) {
    super(swap)

    this._flowName = 'TurboTaker'

    this.stepNumbers = {
      'sign': 1,
      'check-balance': 2,
      'send-to-maker': 3,
      'wait-maker-tx': 4,
      'finish': 5,
      'end': 6
    }

    this.ethSwap = swap.participantSwap
    this.btcSwap = swap.ownerSwap

    if (!this.ethSwap) {
      throw new Error('BTC2ETH: "ethSwap" of type object required')
    }
    if (!this.btcSwap) {
      throw new Error('BTC2ETH: "btcSwap" of type object required')
    }

    this.state = {
      step: 0,

      isStoppedSwap: false,

      signTransactionHash: null,
      isSignFetching: false,
      isMeSigned: false,

      targetWallet : null,

      isBalanceFetching: false,
      isBalanceEnough: true,

      isFinished: false,
      isSwapExist: false,

    }

    super._persistState()

    const flow = this

    flow.swap.room.once('request withdraw', () => {
      flow.setState({
        withdrawRequestIncoming: true,
      })
    })

    flow.swap.room.on('wait btc confirm', () => {
      flow.setState({
        waitBtcConfirm: true,
      })
    })

    flow.swap.room.on('request eth contract', () => {
      console.log('Requesting eth contract')
      const { ethSwapCreationTransactionHash } = flow.state

      if (ethSwapCreationTransactionHash) {
        console.log('Exists - send hash')
        flow.swap.room.sendMessage({
          event: 'create eth contract',
          data: {
            ethSwapCreationTransactionHash,
          },
        })
      }
    })

    super._persistSteps()
  }

  _getSteps() {
    const flow = this

    return [

      // 1. 'sign'

      async () => {
        //flow.swap.processMetamask()

        // raised

        const flow = this
        const swapExists = await flow._checkSwapAlreadyExists()

        if (swapExists) {
          flow.swap.room.sendMessage({
            event: 'swap exists',
          })

          flow.setState({
            isSwapExist: true,
          })

          flow.stopSwapProcess()
        } else {
          const { isSignFetching, isMeSigned } = flow.state

          if (isSignFetching || isMeSigned) {
            return true
          }

          flow.setState({
            isSignFetching: true,
          })

          flow.swap.room.on('request sign', () => {
            flow.swap.room.sendMessage({
              event: 'swap sign',
            })
          })

          flow.swap.room.sendMessage({
            event: 'swap sign',
          })

          flow.finishStep({
            isMeSigned: true,
          }, { step: 'sign', silentError: true })

          return true
        }

      },

      // 2. 'check-balance'

      async () => {
        const { sellAmount } = this.swap

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
          this.finishStep(stateData, { step: 'sync-balance' })
        } else {
          this.setState(stateData, true)
        }
      },

      // 3. 'send-to-maker'

      () => {

      },

      // 4. 'wait-maker-tx'

      () => {

      },

      // 5. 'finish'

      () => {
        flow.swap.room.once('request swap finished', () => {
          const { btcSwapWithdrawTransactionHash } = flow.state

          flow.swap.room.sendMessage({
            event: 'swap finished',
            data: {
              btcSwapWithdrawTransactionHash,
            },
          })
        })

        flow.finishStep({
          isFinished: true,
        }, { step: 'finish' })
      },

      // 6. 'end': Finished!

      () => {}
    ]
  }


  _checkSwapAlreadyExists() {
    const { participant } = this.swap

    const swapData = {
      ownerAddress: this.app.getMyEthAddress(),
      participantAddress: this.app.getParticipantEthAddress(this.swap)
    }

    return this.ethSwap.checkSwapExists(swapData)
  }

  stopSwapProcess() {
    const flow = this

    debug('swap.core:flow')('Swap was stopped')

    flow.setState({
      isStoppedSwap: true,
    }, true)
  }

}

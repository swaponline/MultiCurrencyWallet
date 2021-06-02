import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { Flow } from 'swap.swap'
import BigNumber from 'bignumber.js'
import Swap from 'swap.swap'
import { EthLikeTokenSwap, BtcSwap } from 'swap.swaps'


/*
  Taker-Maker model
  leftSide - Maker
  rightSide - Taker
  
  Свап начинает всегда тейкер
  
  
  flow state {
    makerBlockchain
    makerTokenName
    
    takerBlockchain
    takerTokenName
    
    taker generate secret 
    
    takerCreateSwapTx
    makerCreateSwapTx
    
    takerWithdrawTx
    makerWithdrawTx
  }
  
  
  Шаги определяем по свойству isTakerSide / isMakerSide
  Steps
  Taker                                             Maker
  1. Sign               ->                          1. Sign
  2. genSecret  -> send secret hash ->              2. Wait secret hash
  3. sync balance                                   3. sync-balance
  4. create swap          ->                        4. Wait taker swap
                                                      Check swap (token type, amount, hash)
  5. wait maker swap      ->                        5. Create swap
    Check swap (token type, amount, hash)         
  6. Withdraw maker swap (save secret to contract)  6. Wait withdraw taker from maker -> extract secret
  7. Finish (wait tx for front)                     7. Withdraw
                                                    8. Finish
  
  
  events - for all steps
  
  Taker                                             Maker
  'maker sign' -> go to step 2                      'taker sign' -> send 'maker sign' -> go to step 2
  'request hash' -> send 'secret hash'              'secret hash created' -> save secret hash -> go to step 3
  'request taker swap' -> send tx                   'on taker swap create' -> save tx hash -> check swap -> go to step 4
  'on maker swap create' ->                         'request maker swap' -> send tx
        save tx -> check swap -> go to step 5       
                                                    'on taker withdraw' -> save tx hash -> extract secret -> go to step 6
  'on maker withdraw' -> save tx hash
  
  





*/

interface ITokenTokenOptions {
  makerBlockchain: string // @to-do - blockchain from constants
  makerTokenName: string // @to-do - coins from constants
  takerBlockchain: string
  takerTokenName: string
  getMyAddress: Function
  getParticipantAddress: Function
}

export default class TokenToken extends Flow {
  makerBlockchain: string
  makerTokenName: string
  takerBlockchain: string
  takerTokenName: string
  flowName: string

  takerSwap: EthLikeTokenSwap
  makerSwap: EthLikeTokenSwap
  mySwap: EthLikeTokenSwap

  state: any

  getMyAddress: Function
  getParticipantAddress: Function

  constructor(swap: Swap, options: ITokenTokenOptions) {
    super(swap)
    if (!options.makerBlockchain) throw new Error(`TokenToken - option makerBlockchain required`)
    if (!options.makerTokenName) throw new Error(`TokenToken - option makerTokenName required`)
    if (!options.takerBlockchain) throw new Error(`TokenToken - option takerBlockchain required`)
    if (!options.takerTokenName) throw new Error(`TokenToken - option takerTokenName required`)

    this.makerBlockchain = options.makerBlockchain.toUpperCase()
    this.makerTokenName = options.makerTokenName.toUpperCase()
    this.takerBlockchain = options.takerBlockchain.toUpperCase()
    this.takerTokenName = options.takerTokenName.toUpperCase()

    this.flowName = `{${this.makerBlockchain}}${this.makerTokenName}2{${this.takerBlockchain}}${this.takerTokenName}`

    if (!options.getMyAddress || typeof options.getMyAddress !== 'function') {
      throw new Error(`TokenToken ${this.flowName} - option getMyAddress - function requery`)
    }
    if (!options.getParticipantAddress || typeof options.getParticipantAddress !== 'function') {
      throw new Error(`TokenToken ${this.flowName} - option getParticipantAddress - function requery`)
    }

    this.getMyAddress = options.getMyAddress
    this.getParticipantAddress = options.getParticipantAddress

    this.isTakerMakerModel = true

    this.stepNumbers = (this.isMaker())
      // Maker steps
      ? {
        'sign': 1,
        'wait-secret': 2,
        'sync-balance': 3,
        'wait-taker-lock': 4,
        'lock': 5,
        'wait-taker-withdraw': 6,
        'withdraw': 7,
        'finish': 8,
        'end': 9,
      }
      // Taker steps
      : {
        'sign': 1,
        'submit-secret': 2,
        'sync-balance': 3,
        'lock': 4,
        'wait-maker-lock': 5,
        'withdraw': 6,
        'finish': 7,
        'end': 8,
      }

    this.makerSwap = (this.isMaker()) ? swap.ownerSwap : swap.participantSwap
    this.takerSwap = (this.isTaker()) ? swap.ownerSwap : swap.participantSwap

    if (!this.makerSwap) throw new Error(`TokenToken ${this.flowName} - makerSwap requery`)
    if (!this.takerSwap) throw new Error(`TokenToken ${this.flowName} - takerSwap requery`)

    this.state = {
      step: 0,

      isStoppedSwap: false,

      signTransactionHash: null,
      isSignFetching: false,
      isMeSigned: false,

      targetWallet : null,
      secretHash: null,

      isBalanceFetching: false,
      isBalanceEnough: true,
      balance: null,

      ethSwapCreationTransactionHash: null,
      canCreateEthTransaction: true,
      isEthContractFunded: false,

      secret: null,

      isEthWithdrawn: false,
      isbtcWithdrawn: false,

      ethSwapWithdrawTransactionHash: null,
      utxoSwapWithdrawTransactionHash: null,

      refundTransactionHash: null,
      isRefunded: false,

      isFinished: false,
      isSwapExist: false,

      withdrawRequestIncoming: false,
      withdrawRequestAccepted: false,

      isFailedTransaction: false,
      isFailedTransactionError: null,
      gasAmountNeeded: 0,
    }

    this._persistState()

    const flow = this

    if (this.isTaker()) {
      flow.swap.room.on('maker sign', (data) => { })
      flow.swap.room.on('request hash', (data) => {
        flow.sendSecretHash()
      })
      flow.swap.room.on('request taker swap', (data) => { })
      flow.swap.room.on('on maker swap create', (data) => { })
      flow.swap.room.on('on maker withdraw', (data) => { })

    } else {
      flow.swap.room.on('taker sign', (data) => { })
      flow.swap.room.on('secret hash created', (data) => {
        const { secretHash } = data
        if (secretHash) {
          flow.setState({ secretHash })
        }
      })
      flow.swap.room.on('on taker swap create', (data) => { })
      flow.swap.room.on('request maker swap', (data) => { })
      flow.swap.room.on('on taker withdraw', (data) => { })
    }

    super._persistSteps()
  }

  _persistState() {
    super._persistState()
  }

  //@ts-ignore: strictNullChecks
  _getSteps() {
    const flow = this

    if (this.isMaker()) {
      return [

        // 1. Sign  'sign'
        async () => {
          this.swap.room.once('request sign', () => {
            this.swap.room.sendMessage({
              event: 'swap sign',
            })
            this.setState({
              isParticipantSigned: true,
            }, true)
          })

          const isSignOk = await util.helpers.repeatAsyncUntilResult(() => {
            const {
              isParticipantSigned,
            } = this.state

            this.swap.processMetamask()
            this.swap.room.sendMessage({
              event: 'swap sign',
            })

            return isParticipantSigned
          })
          if (isSignOk) {
            this.finishStep({}, { step: 'sign' })
          }
        },

        // 2. Wait secret hash  'wait-secret'
        async () => {
          const isSecretHashOk = await util.helpers.repeatAsyncUntilResult(async () => {
            const {
              secretHash,
            } = this.state
            if (!secretHash) {
              this.swap.room.sendMessage({
                event: 'request secret hash',
              })
              return false
            }
            return true
          })
          if (isSecretHashOk) {
            this.finishStep({}, { step: 'wait-secret' })
          }
        },

        // 3. Sync-balance  'sync-balance'
        async () => {
          // @to-do - make sync balance
          this.finishStep({}, { step: 'sync-balance' })
        },

        // 4. Wait taker swap 'wait-taker-lock'
        async () => {
          const isTakerLockFunds = await this.waitOtherSideLockFunds()
          if (isTakerLockFunds) {
            this.finishStep({}, { step: 'wait-taker-lock' })
          }
        },

        // 5. Create swap 'lock'
        async () => {},

        // 6. Wait withdraw taker from maker  'wait-taker-withdraw'
        async () => {
          
        },

        // 7. Withdraw  'withdraw'
        async () => {},

        // 8. Finish  'finish'
        async () => {},

        // 9. End 'end'
        async () => {},
      ]
    } else {
      /* Taker steps */
      return [
        // 1. Sign  'sign'
        async () => {
          this.swap.processMetamask()
          this.swap.room.once('swap sign', () => {
            const { step } = this.state

            if (step >= 2) {
              return
            }

            this.setState({
              isParticipantSigned: true,
            }, true)

          })

          this.swap.room.once('swap exists', () => {
            this.setState({
              isSwapExist: true,
            })

            console.log('>>>>>>>>>>> STOP SWAP PROCESS - SWAP EXISTS EVENT')
            this.stopSwapProcess()
          })

          const isSignOk = await util.helpers.repeatAsyncUntilResult(() => {
            const {
              isParticipantSigned,
            } = this.state

            this.swap.processMetamask()
            this.swap.room.sendMessage({
              event: 'request sign',
            })

            return isParticipantSigned
          })

          if (isSignOk) {
            this.finishStep({}, { step: 'sign' })
          }
        },

        // 2. genSecret 'submit-secret'
        async () => {
          if (!this.state.secret) {
            const {
              secret,
              secretHash,
            } = this.generateSecret()

            this.setState({
              secret,
              secretHash,
            }, true)
          }
          this.sendSecretHash()
          this.finishStep({}, { step: 'submit-secret' })
        },

        // 3. Sync-balance  'sync-balance'
        async () => {
          // @to-do - check balance
          this.finishStep({}, { step: 'sync-balance' })
        },

        // 4. Create swap 'lock'
        async () => {
          
        },

        // 5. Wait maker swap 'wait-maker-lock'
        async () => {
          const isMakerLockFunds = await this.waitOtherSideLockFunds()
          if (isMakerLockFunds) {
            this.finishStep({}, { step: 'wait-maker-lock' })
          }
        },

        // 6. Withdraw maker swap 'withdraw'
        async () => {},

        // 7. Finish  'finish'
        async () => {},

        // 9. End 'end'
        async () => {},
      ]
    }
  }

  _checkSwapAlreadyExists() {
    const swapData = {
      ownerAddress: this.getMyAddress(),
      participantAddress: this.getParticipantAddress(this.swap)
    }

    // use taker or maker swap interface ? - may be taker
    // return this.ethTokenSwap.checkSwapExists(swapData)
  }

  async lockFunds() {
    const workSwap = (this.isMaker()) ? this.makerSwap : this.takerSwap
    const flow = this
    const {
      participant,
      buyAmount,
      sellAmount,
    } = this.swap

    const { secretHash } = this.state

    const swapData = {
      participantAddress: abClass.getParticipantAddress(flow.swap),
      secretHash,
      amount: sellAmount,
      targetWallet: (flow.swap.destinationSellAddress)
        ? flow.swap.destinationSellAddress
        : abClass.getParticipantAddress(flow.swap),
      useTargetWallet,
      calcFee: true,
    }

    // TODO fee after allowance
    // EthTokenSwap -> approve need gas too
    /* calc create contract fee and save this */
    /*
    flow.setState({
      createSwapFee: await flow.ethTokenSwap.create(swapData),
    })
    */
    swapData.calcFee = false
    //debug('swap.core:flow')('create swap fee', flow.state.createSwapFee)

    const tryCreateSwap = async () => {
      const { isEthContractFunded } = flow.state

      if (!isEthContractFunded) {
        try {
          debug('swap.core:flow')('fetching allowance')

          const allowance = await abClass.checkAllowance({
            owner: abClass.getMyAddress(),
          })

          debug('swap.core:flow')('allowance', allowance)

          if (new BigNumber(allowance).isLessThan(sellAmount)) {
            debug('swap.core:flow')('allowance < sellAmount', allowance, sellAmount)
            await abClass.approve({
              amount: sellAmount,
            })
          }

          debug('swap.core:flow')('check swap exists')
          const swapExists = await flow._checkSwapAlreadyExists()
          if (swapExists) {
            console.warn('Swap exists!! May be stucked. Try refund')
            await abClass.refund({
              participantAddress: abClass.getParticipantAddress(flow.swap),
            }, (refundTx) => {
              debug('swap.core:flow')('Stucked swap refunded', refundTx)
            })
          }
          await abClass.create(swapData, async (hash) => {
            debug('swap.core:flow')('create swap tx hash', hash)
            flow.swap.room.sendMessage({
              event: 'create eth contract',
              data: {
                ethSwapCreationTransactionHash: hash,
              },
            })

            flow.swap.room.on('request eth contract', () => {
              flow.swap.room.sendMessage({
                event: 'create eth contract',
                data: {
                  ethSwapCreationTransactionHash: hash,
                },
              })
            })

            flow.setState({
              ethSwapCreationTransactionHash: hash,
              canCreateEthTransaction: true,
              isFailedTransaction: false,
            }, true)

            debug('swap.core:flow')('created swap!', hash)
          })

        } catch (error) {
          if (flow.state.ethSwapCreationTransactionHash) {
            console.error('fail create swap, but tx already exists')
            flow.setState({
              canCreateEthTransaction: true,
              isFailedTransaction: false,
            }, true)
            return true
          }
          const { message, gasAmount } = error

          if ( /insufficient funds/.test(message) ) {
            console.error(`Insufficient ETH for gas: ${gasAmount} ETH needed`)

            flow.setState({
              canCreateEthTransaction: false,
              gasAmountNeeded: gasAmount,
            })

            return null
          } else if ( /known transaction/.test(message) ) {
            console.error(`known tx: ${message}`)
          } else if ( /out of gas/.test(message) ) {
            console.error(`tx failed (wrong secret?): ${message}`)
          } else if ( /always failing transaction/.test(message) ) {
            console.error(`Insufficient Token for transaction: ${message}`)
          } else if ( /Failed to check for transaction receipt/.test(message) ) {
            console.error(error)
          } else if ( /replacement transaction underpriced/.test(message) ) {
            console.error(error)
          } else {
            console.error(error)
          }

          flow.setState({
            isFailedTransaction: true,
            isFailedTransactionError: error.message,
          })

          return null
        }
      }

      return true
    }

    const isEthContractFunded = await util.helpers.repeatAsyncUntilResult(() =>
      tryCreateSwap(),
    )

    const { isStoppedSwap } = flow.state

    if (isEthContractFunded && !isStoppedSwap) {
      debug('swap.core:flow')(`finish step`)
      flow.finishStep({
        isEthContractFunded,
      }, {step: stepName})
    }
  }

  async waitOtherSideLockFunds() {
    // Repeat until 
    const workSwap = (this.isMaker()) ? this.takerSwap : this.makerSwap
    const flow = this

    return await util.helpers.repeatAsyncUntilResult(async () => {
      const {
        secretHash,
      } = flow.state
      if (secretHash) {
        const isSwapCreated = await workSwap.isSwapCreated({
          ownerAddress: flow.getParticipantAddress(flow.swap),
          participantAddress: flow.getMyAddress(),
          secretHash,
        })
        if (isSwapCreated) {
          // check - token is valid
          const tokenIsValid = await workSwap.checkTokenIsValid({
            ownerAddress: flow.getParticipantAddress(flow.swap),
            participantAddress: flow.getMyAddress(),
          })
          const tokenIsValid2 = await workSwap.checkTokenIsValid({
            ownerAddress: flow.getMyAddress(),
            participantAddress: flow.getParticipantAddress(flow.swap),
          })
          console.log('>>>>>>>>>>>>>>>>>>>>> check token is valid', tokenIsValid, tokenIsValid2)

          if (tokenIsValid || tokenIsValid2) {
            const destAddressIsOk = await workSwap.checkTargetAddress({ flow })

            if (destAddressIsOk) {
              return true
            } else {
              console.warn('Destination address not valid. Stop swap now!')
            }
          } else {
            console.warn('Token type not valid. Stop swap now!')
          }
        } else {
          console.log('Swap not mined - wait')
        }
      } else {
        flow.swap.room.sendMessage({
          event: 'request hash',
        })
      }
      return false
    })
  }

  sendSecretHash() {
    const {
      secret,
      secretHash,
    } = this.state
    if (secret && secretHash) {
      this.swap.room.sendMessage({
        event: 'secret hash created',
        data: {
          secretHash,
        }
      })
    }
  }

  async signMakerSide() {
    this.swap.room.once('request sign', () => {
      this.swap.room.sendMessage({
        event: 'swap sign',
      })
      this.setState({
        isParticipantSigned: true,
      }, true)
    })

    const isSignOk = await util.helpers.repeatAsyncUntilResult(() => {
      const {
        isParticipantSigned,
      } = this.state

      this.swap.processMetamask()
      this.swap.room.sendMessage({
        event: 'swap sign',
      })

      return isParticipantSigned
    })
    if (isSignOk) {
      this.finishStep({}, { step: 'sign' })
    }
  }

  async signTakerSide() {
    this.swap.processMetamask()
    this.swap.room.once('swap sign', () => {
      const { step } = this.state

      if (step >= 2) {
        return
      }

      this.setState({
        isParticipantSigned: true,
      }, true)

    })

    this.swap.room.once('swap exists', () => {
      this.setState({
        isSwapExist: true,
      })

      console.log('>>>>>>>>>>> STOP SWAP PROCESS - SWAP EXISTS EVENT')
      this.stopSwapProcess()
    })

    const isSignOk = await util.helpers.repeatAsyncUntilResult(() => {
      const {
        isParticipantSigned,
      } = this.state

      this.swap.processMetamask()
      this.swap.room.sendMessage({
        event: 'request sign',
      })

      return isParticipantSigned
    })

    if (isSignOk) {
      this.finishStep({}, { step: 'sign' })
    }
  }

  async tryRefund() {
    /*
    const { secretHash } = this.state

    const refundHandler = (hash = null) => {
      this.swap.room.sendMessage({
        event: 'eth refund completed',
      })

      this.setState({
        refundTransactionHash: hash,
        isRefunded: true,
        isSwapExist: false,
      }, true)
    }

    try {
      const wasRefunded = await this.ethTokenSwap.wasRefunded({ secretHash })

      if (wasRefunded) {
        debug('swap.core:flow')('This swap was refunded')

        refundHandler()

        return true
      }
    } catch (error) {
      console.warn('wasRefunded error:', error)

      return false
    }

    return this.ethTokenSwap.refund({
      participantAddress: this.getParticipantAddress(this.swap),
    })
      .then((hash) => {
        if (!hash) {
          return false
        }

        //@ts-ignore: strictNullChecks
        refundHandler(hash)

        return true
      })
      .catch((error) => false)
    */
  }



  async isRefundSuccess() {
    return true
  }

  async tryWithdraw(_secret) {
    /*
    const { secret, secretHash, isEthWithdrawn, isbtcWithdrawn, utxoScriptValues } = this.state

    if (!_secret)
      throw new Error(`Withdrawal is automatic. For manual withdrawal, provide a secret`)

    if (!utxoScriptValues)
      throw new Error(`Cannot withdraw without script values`)

    if (secret && secret != _secret)
      console.warn(`Secret already known and is different. Are you sure?`)

    if (isbtcWithdrawn)
      console.warn(`Looks like money were already withdrawn, are you sure?`)

    debug('swap.core:flow')(`WITHDRAW using secret = ${_secret}`)

    const _secretHash = this.app.env.bitcoin.crypto.ripemd160(Buffer.from(_secret, 'hex')).toString('hex')

    if (secretHash != _secretHash)
      console.warn(`Hash does not match! state: ${secretHash}, given: ${_secretHash}`)

    const {scriptAddress} = this.btcSwap.createScript(utxoScriptValues)
    const balance = await this.btcSwap.getBalance(scriptAddress)

    debug('swap.core:flow')(`address=${scriptAddress}, balance=${balance}`)

    if (balance === 0) {
      this.finishStep({
        isbtcWithdrawn: true,
      }, {step: 'withdraw-utxo'})
      throw new Error(`Already withdrawn: address=${scriptAddress},balance=${balance}`)
    }

    this.btcSwap.withdraw({
      scriptValues: utxoScriptValues,
      secret: _secret,
    }).then((hash) => {
      debug('swap.core:flow')(`TX hash=${hash}`)
      this.setState({
        utxoSwapWithdrawTransactionHash: hash,
      })

      debug('swap.core:flow')(`TX withdraw sent: ${this.state.utxoSwapWithdrawTransactionHash}`)

      this.finishStep({
        isbtcWithdrawn: true,
      }, { step: 'withdraw-utxo' })
    })
    
    */
  }
}
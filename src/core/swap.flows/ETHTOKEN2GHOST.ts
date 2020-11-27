import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { Flow } from 'swap.swap'


export default (tokenName) => {

  class ETHTOKEN2GHOST extends Flow {

    _flowName: string
    ethTokenSwap: any
    ghostSwap: any
    state: any

    static getName() {
      return `${this.getFromName()}2${this.getToName()}`
    }
    static getFromName() {
      return tokenName.toUpperCase()
    }
    static getToName() {
      return constants.COINS.ghost
    }
    constructor(swap) {
      super(swap)

      this._flowName = ETHTOKEN2GHOST.getName()

      this.stepNumbers = {
        'sign': 1,
        'wait-lock-ghost': 2,
        'verify-script': 3,
        'sync-balance': 4,
        'lock-eth': 5,
        'wait-withdraw-eth': 6, // aka getSecret
        'withdraw-ghost': 7,
        'finish': 8,
        'end': 9
      }

      this.ethTokenSwap = swap.participantSwap
      this.ghostSwap = swap.ownerSwap

      if (!this.ethTokenSwap) {
        throw new Error('ETHTOKEN2GHOST: "ethTokenSwap" of type object required')
      }
      if (!this.ghostSwap) {
        throw new Error('ETHTOKEN2GHOST: "ghostSwap" of type object required')
      }

      this.state = {
        step: 0,

        isStoppedSwap: false,

        signTransactionHash: null,
        isSignFetching: false,
        isMeSigned: false,

        targetWallet : null,
        secretHash: null,
        ghostScriptValues: null,

        ghostScriptVerified: false,

        isBalanceFetching: false,
        isBalanceEnough: true,
        balance: null,

        ghostScriptCreatingTransactionHash: null,
        ethSwapCreationTransactionHash: null,
        canCreateEthTransaction: true,
        isEthContractFunded: false,

        secret: null,

        isEthWithdrawn: false,
        isGhostWithdrawn: false,

        ethSwapWithdrawTransactionHash: null,
        ghostSwapWithdrawTransactionHash: null,

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
      flow.swap.room.once('request withdraw', () => {
        flow.setState({
          withdrawRequestIncoming: true,
        })
      })

      super._persistSteps()
    }

    _persistState() {
      super._persistState()
    }

    _getSteps() {
      const flow = this

      return [

        // 1. Sign swap to start

        () => {
          //@ts-ignore
          this.processMetamask()
          // this.sign()
        },

        // 2. Wait participant create, fund GHOST Script

        () => {
          flow.swap.room.on('create ghost script', ({ scriptValues, ghostScriptCreatingTransactionHash }) => {
            const { step } = flow.state

            if (step >= 3) {
              return
            }

            flow.finishStep({
              secretHash: scriptValues.secretHash,
              ghostScriptValues: scriptValues,
              ghostScriptCreatingTransactionHash,
            }, { step: 'wait-lock-ghost', silentError: true })
          })

          flow.swap.room.sendMessage({
            event: 'request ghost script',
          })
        },

        // 3. Verify GHOST Script

        () => {
          debug('swap.core:flow')(`waiting verify ghost script`)
          // this.verifyGhostScript()
        },

        // 4. Check balance

        () => {
          this.syncBalance()
        },

        // 5. Create ETH Contract

        async () => {
          const { participant, buyAmount, sellAmount } = flow.swap
          const { secretHash } = flow.state

          const utcNow = () => Math.floor(Date.now() / 1000)

          const isGhostScriptOk = await util.helpers.repeatAsyncUntilResult(async (stopRepeat) => {
            const { ghostScriptValues } = flow.state

            const scriptCheckError = await flow.ghostSwap.checkScript(ghostScriptValues, {
              value: buyAmount,
              recipientPublicKey: this.app.services.auth.accounts.ghost.getPublicKey(),
              lockTime: utcNow(),
              confidence: 0.8,
            })

            if (scriptCheckError) {
              if (/Expected script lockTime/.test(scriptCheckError)) {
                console.error('Ghost script check error: ghost was refunded', scriptCheckError)
                flow.stopSwapProcess()
                stopRepeat()
              } else if (/Expected script value/.test(scriptCheckError)) {
                console.warn('Ghost script check: waiting balance')
              } else {
                flow.swap.events.dispatch('ghost script check error', scriptCheckError)
              }

              return false
            } else {
              return true
            }
          })

          if (!isGhostScriptOk) {
            return
          }

          const swapData = {
            participantAddress: this.app.getParticipantEthAddress(flow.swap),
            secretHash,
            amount: sellAmount,
            targetWallet: flow.swap.destinationSellAddress,
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
                const allowance = await flow.ethTokenSwap.checkAllowance({
                  spender: this.app.getMyEthAddress(),
                })

                debug('swap.core:flow')('allowance', allowance)
                if (allowance < sellAmount) {
                  debug('swap.core:flow')('allowance < sellAmount', allowance, sellAmount)
                  await flow.ethTokenSwap.approve({
                    amount: sellAmount,
                  })
                }

                debug('swap.core:flow')('create swap', swapData)
                await flow.ethTokenSwap.create(swapData, async (hash) => {
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
            }, {step: 'lock-eth'})
          }
        },

        // 6. Wait participant withdraw

        async () => {
          flow.swap.room.once('ethWithdrawTxHash', async ({ethSwapWithdrawTransactionHash}) => {
            flow.setState({
              ethSwapWithdrawTransactionHash,
            }, true)

            const secretFromTxhash = await util.helpers.extractSecretFromTx({
              flow,
              swapFlow: flow.ethTokenSwap,
              app: this.app,
              ethSwapWithdrawTransactionHash,
            })

            const { isEthWithdrawn } = flow.state

            if (!isEthWithdrawn && secretFromTxhash) {
              debug('swap.core:flow')('got secret from tx', ethSwapWithdrawTransactionHash, secretFromTxhash)
              flow.finishStep({
                isEthWithdrawn: true,
                secret: secretFromTxhash,
              }, {step: 'wait-withdraw-eth'})
            }
          })

          flow.swap.room.sendMessage({
            event: 'request ethWithdrawTxHash',
          })

          // If partner decides to scam and doesn't send ethWithdrawTxHash
          // then we try to withdraw as in ETHTOKEN2USDT

          const { participant } = flow.swap

          const checkSecretExist = async () => {
            return await util.helpers.extractSecretFromContract({
              flow,
              swapFlow: flow.ethTokenSwap,
              participantAddress: this.app.getParticipantEthAddress(flow.swap),
              ownerAddress: flow.app.getMyEthAddress(),
              app: this.app,
            })
          }

          const secretFromContract = await util.helpers.repeatAsyncUntilResult((stopRepeat) => {
            const { isEthWithdrawn, isRefunded } = flow.state

            if (isEthWithdrawn || isRefunded) {
              stopRepeat()

              return false
            }

            return checkSecretExist()
          })

          const { isEthWithdrawn } = this.state

          if (secretFromContract && !isEthWithdrawn) {
            debug('swap.core:flow')('got secret from smart contract', secretFromContract)

            flow.finishStep({
              isEthWithdrawn: true,
              secret: secretFromContract,
            }, { step: 'wait-withdraw-eth' })
          }
        },

        // 7. Withdraw

        async () => {
          await util.helpers.repeatAsyncUntilResult((stopRepeat) => {
            const { secret, ghostScriptValues, ghostSwapWithdrawTransactionHash } = flow.state

            if (ghostSwapWithdrawTransactionHash) {
              return true
            }

            if (!ghostScriptValues) {
              console.error('There is no "ghostScriptValues" in state. No way to continue swap...')
              return null
            }

            return flow.ghostSwap.withdraw({
              scriptValues: ghostScriptValues,
              secret,
              destinationAddress: flow.swap.destinationBuyAddress,
            })
              .then((hash) => {
                flow.setState({
                  ghostSwapWithdrawTransactionHash: hash,
                }, true)
                return true
              })
              .catch((error) => null)
          })

          flow.finishStep({
            isGhostWithdrawn: true,
          }, { step: 'withdraw-ghost' })
        },

        // 8. Finish

        () => {
          flow.swap.room.once('request swap finished', () => {
            const { ghostSwapWithdrawTransactionHash } = flow.state

            flow.swap.room.sendMessage({
              event: 'swap finished',
              data: {
                ghostSwapWithdrawTransactionHash,
              },
            })
          })

          flow.finishStep({
            isFinished: true,
          }, { step: 'finish' })
        },

        // 9. Finished!

        () => {},
      ]
    }

    acceptWithdrawRequest() {
      const flow = this
      const { withdrawRequestAccepted } = flow.state

      if (withdrawRequestAccepted) {
        return
      }

      this.setState({
        withdrawRequestAccepted: true,
      })

      this.swap.room.once('do withdraw', async ({secret}) => {
        try {
          const data = {
            participantAddress: this.app.getParticipantEthAddress(flow.swap),
            secret,
          }

          await flow.ethTokenSwap.withdrawNoMoney(data, (hash) => {
            flow.swap.room.sendMessage({
              event: 'withdraw ready',
              data: {
                ethSwapWithdrawTransactionHash: hash,
              }
            })
          })
        } catch (error) {
          debug('swap.core:flow')(error.message)
        }
      })

      this.swap.room.sendMessage({
        event: 'accept withdraw request'
      })
    }

    _checkSwapAlreadyExists() {
      const { participant } = this.swap
      const flow = this

      const swapData = {
        ownerAddress: this.app.getMyEthAddress(),
        participantAddress: this.app.getParticipantEthAddress(flow.swap)
      }

      return this.ethTokenSwap.checkSwapExists(swapData)
    }

    async sign() {
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

        flow.swap.room.once('ghost refund completed', () => {
          flow.tryRefund()
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
    }

    verifyGhostScript() {
      const flow = this
      const { ghostScriptVerified, ghostScriptValues } = flow.state

      if (ghostScriptVerified) {
        return true
      }

      if (!ghostScriptValues) {
        throw new Error(`No script, cannot verify`)
      }

      flow.finishStep({
        ghostScriptVerified: true,
      }, { step: 'verify-script' })

      return true
    }

    async syncBalance() {
      const { sellAmount } = this.swap

      this.setState({
        isBalanceFetching: true,
      })

      const balance = await this.ethTokenSwap.fetchBalance(this.app.getMyEthAddress())
      const isEnoughMoney = sellAmount.isLessThanOrEqualTo(balance)

      const stateData = {
        balance,
        isBalanceFetching: false,
        isBalanceEnough: isEnoughMoney,
      }

      if (isEnoughMoney) {
        this.finishStep(stateData, { step: 'sync-balance' })
      }
      else {
        this.setState(stateData, true)
      }
    }

    async tryRefund() {
      const { participant } = this.swap
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
        participantAddress: this.app.getParticipantEthAddress(this.swap),
      })
        .then((hash) => {
          if (!hash) {
            return false
          }

          refundHandler(hash)

          return true
        })
        .catch((error) => false)
    }

    stopSwapProcess() {
      const flow = this

      console.warn('Swap was stopped')

      flow.setState({
        isStoppedSwap: true,
      }, true)
    }

    async isRefundSuccess() {
      return true
    }

    async tryWithdraw(_secret) {
      const { secret, secretHash, isEthWithdrawn, isGhostWithdrawn, ghostScriptValues } = this.state

      if (!_secret)
        throw new Error(`Withdrawal is automatic. For manual withdrawal, provide a secret`)

      if (!ghostScriptValues)
        throw new Error(`Cannot withdraw without script values`)

      if (secret && secret != _secret)
        console.warn(`Secret already known and is different. Are you sure?`)

      if (isGhostWithdrawn)
        console.warn(`Looks like money were already withdrawn, are you sure?`)

      debug('swap.core:flow')(`WITHDRAW using secret = ${_secret}`)

      const _secretHash = this.app.env.bitcoin.crypto.ripemd160(Buffer.from(_secret, 'hex')).toString('hex')

      if (secretHash != _secretHash)
        console.warn(`Hash does not match! state: ${secretHash}, given: ${_secretHash}`)

      const {scriptAddress} = this.ghostSwap.createScript(ghostScriptValues)
      const balance = await this.ghostSwap.getBalance(scriptAddress)

      debug('swap.core:flow')(`address=${scriptAddress}, balance=${balance}`)

      if (balance === 0) {
        this.finishStep({
          isGhostWithdrawn: true,
        }, {step: 'withdraw-ghost'})
        throw new Error(`Already withdrawn: address=${scriptAddress},balance=${balance}`)
      }

      await this.ghostSwap.withdraw({
        scriptValues: ghostScriptValues,
        secret: _secret,
      }, (hash) => {
        debug('swap.core:flow')(`TX hash=${hash}`)
        this.setState({
          ghostSwapWithdrawTransactionHash: hash,
        })
      })
      debug('swap.core:flow')(`TX withdraw sent: ${this.state.ghostSwapWithdrawTransactionHash}`)

      this.finishStep({
        isGhostWithdrawn: true,
      }, { step: 'withdraw-ghost' })
    }

    async checkOtherSideRefund() {
      if (typeof this.ghostSwap.checkWithdraw === 'function') {
        const { btcScriptValues } = this.state
        if (btcScriptValues) {
          const { scriptAddress } = this.ghostSwap.createScript(btcScriptValues)

          const destinationAddress = this.swap.destinationBuyAddress
          const destAddress = (destinationAddress) ? destinationAddress : this.app.services.auth.accounts.btc.getAddress()

          const hasWithdraw = await this.ghostSwap.checkWithdraw(scriptAddress)
          if (hasWithdraw
            && hasWithdraw.address.toLowerCase() != destAddress.toLowerCase()
          ) {
            return true
          }
        }
      }
      return false
    }
  }

  return ETHTOKEN2GHOST
}

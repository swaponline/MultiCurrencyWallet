import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { Flow } from 'swap.swap'
import { BigNumber } from 'bignumber.js'


export default (tokenName) => {

  class NEXT2ETHTOKEN extends Flow {

    static getName() {
      return `${this.getFromName()}2${this.getToName()}`
    }
    static getFromName() {
      return constants.COINS.next
    }
    static getToName() {
      return tokenName.toUpperCase()
    }
    constructor(swap) {
      super(swap)

      this._flowName = NEXT2ETHTOKEN.getName()

      this.stepNumbers = {
        'sign': 1,
        'submit-secret': 2,
        'sync-balance': 3,
        'lock-next': 4,
        'wait-lock-eth': 5,
        'withdraw-eth': 6,
        'finish': 7,
        'end': 8
      }

      this.ethTokenSwap = swap.ownerSwap
      this.nextSwap      = swap.participantSwap

      if (!this.ethTokenSwap) {
        throw new Error('NEXT2ETH: "ethTokenSwap" of type object required')
      }
      if (!this.nextSwap) {
        throw new Error('NEXT2ETH: "nextSwap" of type object required')
      }

      this.state = {
        step: 0,

        isStoppedSwap: false,

        signTransactionHash: null,
        isSignFetching: false,
        isParticipantSigned: false,

        nextScriptCreatingTransactionHash: null,
        ethSwapCreationTransactionHash: null,

        secretHash: null,
        nextScriptValues: null,

        nextScriptVerified: false,

        isBalanceFetching: false,
        isBalanceEnough: true,
        balance: null,

        isEthContractFunded: false,

        nextSwapWithdrawTransactionHash: null,
        ethSwapWithdrawTransactionHash: null,

        secret: null,

        canCreateEthTransaction: true,
        isEthWithdrawn: false,

        refundTransactionHash: null,
        isRefunded: false,

        withdrawFee: null,
        refundTxHex: null,
        isFinished: false,
        isSwapExist: false,
      }

      this._persistState()
      super._persistSteps()
    }

    _persistState() {
      super._persistState()
    }

    _getSteps() {
      const flow = this

      return [

        // 1. Signs

        async () => {
          flow.swap.processMetamask()
          flow.swap.room.once('swap sign', () => {
            const { step } = flow.state

            if (step >= 2) {
              return
            }

            flow.swap.room.once('eth refund completed', () => {
              flow.tryRefund()
            })

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

        // 2. Create secret, secret hash and NEXT script

        () => {
          // this.submitSecret()
        },

        // 3. Check system wallet balance

        () => {
          this.syncBalance()
        },

        // 4. Create NEXT Script, fund, notify participant

        async () => {
          const onTransactionHash = (txID) => {
            const { nextScriptCreatingTransactionHash, nextScriptValues } = flow.state

            if (nextScriptCreatingTransactionHash) {
              return
            }

            flow.setState({
              nextScriptCreatingTransactionHash: txID,
            })

            flow.swap.room.once('request next script', () => {
              flow.swap.room.sendMessage({
                event:  'create next script',
                data: {
                  scriptValues: nextScriptValues,
                  nextScriptCreatingTransactionHash: txID,
                }
              })
            })

            flow.swap.room.sendMessage({
              event: 'create next script',
              data: {
                scriptValues : nextScriptValues,
                nextScriptCreatingTransactionHash : txID,
              }
            })
          }

          const { sellAmount } = flow.swap
          const { isBalanceEnough, nextScriptValues } = flow.state

          if (isBalanceEnough) {
            await flow.nextSwap.fundScript({
              scriptValues: nextScriptValues,
              amount: sellAmount,
            })
          }

          const checkNEXTScriptBalance = async () => {
            const { scriptAddress } = this.nextSwap.createScript(nextScriptValues)
            const unspents = await this.nextSwap.fetchUnspents(scriptAddress)

            if (unspents.length === 0) {
              return false
            }

            const txID = unspents[0].txid

            const balance = await this.nextSwap.getBalance(nextScriptValues)

            const isEnoughMoney = BigNumber(balance).isGreaterThanOrEqualTo(sellAmount.times(1e8))

            if (isEnoughMoney) {
              flow.setState({
                scriptBalance: BigNumber(balance).div(1e8).dp(8),
              })

              onTransactionHash(txID)
            }

            return isEnoughMoney
          }

          await util.helpers.repeatAsyncUntilResult(async (stopRepeat) => {
            const { isStoppedSwap } = flow.state

            if (!isStoppedSwap) {
              return await checkNEXTScriptBalance()
            } else {
              stopRepeat()
            }
          })

          const { isStoppedSwap } = flow.state

          if (!isStoppedSwap) {
            flow.finishStep({
              isNextScriptFunded: true,
            }, { step: 'lock-next' })
          }
        },

        // 5. Wait participant creates ETH Contract

        async () => {
          flow.swap.room.sendMessage({
            event: 'request eth contract',
          })

          flow.swap.room.once('request next script', () => {
            const { nextScriptValues, nextScriptCreatingTransactionHash } = flow.state

            flow.swap.room.sendMessage({
              event:  'create next script',
              data: {
                scriptValues: nextScriptValues,
                nextScriptCreatingTransactionHash,
              }
            })
          })

          const { participant } = flow.swap

          flow.swap.room.on('create eth contract', ({ ethSwapCreationTransactionHash }) => {
            flow.setState({
              ethSwapCreationTransactionHash,
            }, true)
          })

          const isContractBalanceOk = await util.helpers.repeatAsyncUntilResult(async () => {
            const balance = await flow.ethTokenSwap.getBalance({
              ownerAddress: participant.eth.address,
            })

            debug('swap.core:flow')('Checking contract balance:', balance)

            if (balance > 0) {
              return true
            }

            return false
          })

          if (isContractBalanceOk) {
            const { isEthContractFunded } = flow.state

            if (!isEthContractFunded) {
              flow.finishStep({
                isEthContractFunded: true,
              }, { step: 'wait-lock-eth' })
            }
          }
        },

        // 6. Withdraw

        async () => {
          const { buyAmount, participant } = flow.swap
          const { secretHash, secret } = flow.state

          const data = {
            ownerAddress: participant.eth.address,
            secret,
          }

          const balanceCheckError = await flow.ethTokenSwap.checkBalance({
            ownerAddress: this.app.getParticipantEthAddress(this.swap),
            participantAddress: this.app.getMyEthAddress(),
            expectedValue: buyAmount,
            expectedHash: secretHash,
          })

          if (balanceCheckError) {
            console.error('Waiting until deposit: ETH balance check error:', balanceCheckError)
            flow.swap.events.dispatch('eth balance check error', balanceCheckError)

            return
          }

          if (flow.ethTokenSwap.hasTargetWallet()) {
            const targetWallet = await flow.ethTokenSwap.getTargetWallet( participant.eth.address )
            const needTargetWallet = (flow.swap.destinationBuyAddress)
              ? flow.swap.destinationBuyAddress
              : this.app.getMyEthAddress()

            if (targetWallet.toLowerCase() != needTargetWallet.toLowerCase()) {
              console.error(
                "Destination address for tokens dismatch with needed (Needed, Getted). Stop swap now!",
                needTargetWallet,
                targetWallet,
              )

              flow.swap.events.dispatch('address for tokens invalid', {
                needed: needTargetWallet,
                getted: targetWallet,
              })

              return
            }
          }

          const tokenAddressIsValid = await flow.ethTokenSwap.checkTokenIsValid({
            ownerAddress: this.app.getParticipantEthAddress(this.swap),
            participantAddress: this.app.getMyEthAddress(),
          })

          if (!tokenAddressIsValid) {
            console.error("Tokens, blocked at contract dismatch with needed. Stop swap now!")
            return
          }

          const onWithdrawReady = () => {
            flow.swap.room.once('request ethWithdrawTxHash', () => {
              const { ethSwapWithdrawTransactionHash } = flow.state

              flow.swap.room.sendMessage({
                event: 'ethWithdrawTxHash',
                data: {
                  ethSwapWithdrawTransactionHash,
                },
              })
            })

            const { step } = flow.state

            if (step >= 7) {
              return
            }

            flow.finishStep({
              isEthWithdrawn: true,
            }, 'withdraw-eth')
          }

          const tryWithdraw = async (stopRepeater) => {
            const { isEthWithdrawn } = flow.state

            if (!isEthWithdrawn) {
              try {
                const { withdrawFee } = flow.state

                if (!withdrawFee) {
                  const withdrawNeededGas = await flow.ethTokenSwap.calcWithdrawGas({
                    ownerAddress: data.ownerAddress,
                    secret,
                  })
                  flow.setState({
                    withdrawFee: withdrawNeededGas,
                  })
                  debug('swap.core:flow')('withdraw gas fee', withdrawNeededGas)
                }

                await flow.ethTokenSwap.withdraw(data, (hash) => {
                  flow.setState({
                    isEthWithdrawn: true,
                    ethSwapWithdrawTransactionHash: hash,
                    canCreateEthTransaction: true,
                    requireWithdrawFee: false,
                  }, true)

                  flow.swap.room.sendMessage({
                    event: 'ethWithdrawTxHash',
                    data: {
                      ethSwapWithdrawTransactionHash: hash,
                    }
                  })
                })

                stopRepeater()
                return true
              } catch (err) {
                if ( /known transaction/.test(err.message) ) {
                  console.error(`known tx: ${err.message}`)
                  stopRepeater()
                  return true
                } else if ( /out of gas/.test(err.message) ) {
                  console.error(`tx failed (wrong secret?): ${err.message}`)
                } else if ( /insufficient funds for gas/.test(err.message) ) {
                  console.error(`insufficient fund for gas: ${err.message}`)

                  debug('swap.core:flow')('insufficient fund for gas... wait fund or request other side to withdraw')

                  const { requireWithdrawFee } = this.state

                  if (!requireWithdrawFee) {
                    flow.swap.room.once('withdraw ready', ({ethSwapWithdrawTransactionHash}) => {
                      flow.setState({
                        ethSwapWithdrawTransactionHash,
                      })

                      onWithdrawReady()
                    })

                    flow.setState({
                      requireWithdrawFee: true,
                    })
                  }

                } else {
                  console.error(err)
                }

                flow.setState({
                  canCreateEthTransaction: false,
                })

                return null
              }
            }

            return true
          }

          const isEthWithdrawn = await util.helpers.repeatAsyncUntilResult((stopRepeater) =>
            tryWithdraw(stopRepeater),
          )

          if (isEthWithdrawn) {
            onWithdrawReady()
          }
        },

        // 7. Finish

        () => {
          flow.swap.room.once('swap finished', ({nextSwapWithdrawTransactionHash}) => {
            flow.setState({
              nextSwapWithdrawTransactionHash,
            })
          })

          flow.swap.room.sendMessage({
            event: 'request swap finished',
          })

          flow.finishStep({
            isFinished: true,
          }, 'finish')
        },

        // 8. Finished!

        () => {}
      ]
    }

    /**
     * TODO - backport version compatibility
     *  mapped to sendWithdrawRequestToAnotherParticipant
     *  remove at next iteration after client software update
     *  Used in swap.react
     */
    sendWithdrawRequest() {
      return this.sendWithdrawRequestToAnotherParticipant()
    }

    sendWithdrawRequestToAnotherParticipant() {
      const flow = this

      const { requireWithdrawFee, requireWithdrawFeeSended } = flow.state

      if (!requireWithdrawFee || requireWithdrawFeeSended) {
        return
      }

      flow.setState({
        requireWithdrawFeeSended: true,
      })

      flow.swap.room.on('accept withdraw request', () => {
        flow.swap.room.sendMessage({
          event: 'do withdraw',
          data: {
            secret: flow.state.secret,
          }
        })
      })

      flow.swap.room.sendMessage({
        event: 'request withdraw',
      })
    }

    submitSecret(secret) {
      if (this.state.secretHash) { return }

      if (!this.state.isParticipantSigned) {
        throw new Error(`Cannot proceed: participant not signed. step=${this.state.step}`)
      }

      const secretHash = this.app.env.bitcoin.crypto.ripemd160(Buffer.from(secret, 'hex')).toString('hex')

      /* Secret hash generated - create NEXT script - and only after this notify other part */
      this.createWorkNEXTScript(secretHash);

      const _secret = `0x${secret.replace(/^0x/, '')}`

      this.finishStep({
        secret: _secret,
        secretHash,
      }, { step: 'submit-secret' })
    }

    getNEXTScriptAddress() {
      const { scriptAddress } = this.state
      return scriptAddress;
    }

    createWorkNEXTScript(secretHash) {
      if (this.state.nextScriptValues) {
        debug('swap.core:flow')('NEXT Script already generated', this.state.nextScriptValues);
        return;
      }
      const { participant } = this.swap

      const utcNow = () => Math.floor(Date.now() / 1000)
      const getLockTime = () => utcNow() + 60 * 60 * 3 // 3 hours from now

      const scriptValues = {
        secretHash: secretHash,
        ownerPublicKey: this.app.services.auth.accounts.next.getPublicKey(),
        recipientPublicKey: participant.next.publicKey,
        lockTime: getLockTime(),
      }
      const { scriptAddress } = this.nextSwap.createScript(scriptValues)

      this.setState({
        scriptAddress: scriptAddress,
        nextScriptValues: scriptValues,
      });
    }

    async skipSyncBalance() {
      this.finishStep({}, { step: 'sync-balance' })
    }

    async syncBalance() {
      const { sellAmount } = this.swap

      this.setState({
        isBalanceFetching: true,
      })

      const nextAddress = this.app.services.auth.accounts.next.getAddress()

      const txFee = await this.nextSwap.estimateFeeValue({ method: 'swap', fixed: true, address: nextAddress })
      const unspents = await this.nextSwap.fetchUnspents(nextAddress)
      const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
      const balance = BigNumber(totalUnspent).dividedBy(1e8)

      const needAmount = sellAmount.plus(txFee)
      const isEnoughMoney = needAmount.isLessThanOrEqualTo(balance)

      const stateData = {
        balance,
        isBalanceFetching: false,
        isBalanceEnough: isEnoughMoney,
      }

      if (isEnoughMoney) {
        this.finishStep(stateData, { step: 'sync-balance' })
      } else {
        this.setState(stateData, true)
      }
    }

    getRefundTxHex = () => {
      this.nextSwap.getRefundHexTransaction({
        scriptValues: this.state.nextScriptValues,
        secret: this.state.secret,
      })
        .then((txHex) => {
          this.setState({
            refundTxHex: txHex,
          })
        })
    }

    tryRefund() {
      const flow = this
      const { nextScriptValues, secret } = flow.state

      return flow.nextSwap.refund({
        scriptValues: nextScriptValues,
        secret: secret,
      })
        .then((hash) => {
          if (!hash) {
            return false
          }

          this.swap.room.sendMessage({
            event: 'next refund completed',
          })

          flow.setState({
            refundTransactionHash: hash,
            isRefunded: true,
            isSwapExist: false,
          }, true)

          return true
        })
        .catch((error) => {
          if (/Address is empty/.test(error)) {
            // TODO - fetch TX list to script for refund TX
            flow.setState({
              isRefunded: true,
              isSwapExist: false,
            }, true)
            return true
          } else {
            console.warn('Next refund:', error)

            return false
          }
        })
    }

    stopSwapProcess() {
      const flow = this

      console.warn('Swap was stoped')

      flow.setState({
        isStoppedSwap: true,
      }, true)
    }

    async isRefundSuccess() {
      const { refundTransactionHash, isRefunded } = this.state
      if (refundTransactionHash && isRefunded) {
        if (await this.nextSwap.checkTX(refundTransactionHash)) {
          return true
        } else {
          console.warn('NEXT2ETHTOKEN - unknown refund transaction')
          this.setState( {
            refundTransactionHash: null,
            isRefunded: false,
          } )
          return false
        }
      }
      return false
    }

    async tryWithdraw(_secret) {
      const { secret, secretHash, isEthWithdrawn } = this.state

      if (!_secret)
        throw new Error(`Withdrawal is automatic. For manual withdrawal, provide a secret`)

      if (secret && secret != _secret)
        console.warn(`Secret already known and is different. Are you sure?`)

      if (isEthWithdrawn)
        console.warn(`Looks like money were already withdrawn, are you sure?`)

      debug('swap.core:flow')(`WITHDRAW using secret = ${_secret}`)

      const _secretHash = this.app.env.bitcoin.crypto.ripemd160(Buffer.from(_secret, 'hex')).toString('hex')

      if (secretHash != _secretHash)
        console.warn(`Hash does not match! state: ${secretHash}, given: ${_secretHash}`)

      const { participant } = this.swap

      const data = {
        ownerAddress: participant.eth.address,
        secret: _secret,
      }

      await this.ethTokenSwap.withdraw(data, (hash) => {
        debug('swap.core:flow')(`TX hash=${hash}`)
        this.setState({
          ethSwapWithdrawTransactionHash: hash,
          canCreateEthTransaction: true,
        })
      }).then(() => {

        this.finishStep({
          isEthWithdrawn: true,
        }, 'withdraw-eth')
      })
    }
  }

  return NEXT2ETHTOKEN
}

import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { Flow } from 'swap.swap'
import { BigNumber } from 'bignumber.js'


export default (tokenName) => {

  class BTC2ETHTOKEN extends Flow {

    static getName() {
      return `${this.getFromName()}2${this.getToName()}`
    }
    static getFromName() {
      return constants.COINS.btc
    }
    static getToName() {
      return tokenName.toUpperCase()
    }
    constructor(swap) {
      super(swap)

      this._flowName = BTC2ETHTOKEN.getName()

      this.stepNumbers = {
        'sign': 1,
        'submit-secret': 2,
        'sync-balance': 3,
        'lock-btc': 4,
        'wait-lock-eth': 5,
        'withdraw-eth': 6,
        'finish': 7,
        'end': 8
      }

      this.ethTokenSwap = swap.ownerSwap
      this.btcSwap      = swap.participantSwap

      if (!this.ethTokenSwap) {
        throw new Error('BTC2ETH: "ethTokenSwap" of type object required')
      }
      if (!this.btcSwap) {
        throw new Error('BTC2ETH: "btcSwap" of type object required')
      }

      this.state = {
        step: 0,

        isStoppedSwap: false,

        signTransactionHash: null,
        isSignFetching: false,
        isParticipantSigned: false,

        btcScriptCreatingTransactionHash: null,
        ethSwapCreationTransactionHash: null,

        secretHash: null,
        btcScriptValues: null,

        btcScriptVerified: false,

        isBalanceFetching: false,
        isBalanceEnough: true,
        balance: null,

        isEthContractFunded: false,

        btcSwapWithdrawTransactionHash: null,
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

      super._persistSteps()
      this._persistState()
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

        // 2. Create secret, secret hash and BTC script

        () => {
          // this.submitSecret()
        },

        // 3. Check system wallet balance

        () => {
          this.syncBalance()
        },

        // 4. Create BTC Script, fund, notify participant

        async () => {
          const onTransactionHash = (txID) => {
            const { btcScriptCreatingTransactionHash, btcScriptValues } = flow.state

            if (btcScriptCreatingTransactionHash) {
              return
            }

            flow.setState({
              btcScriptCreatingTransactionHash: txID,
            })

            flow.swap.room.once('request btc script', () => {
              flow.swap.room.sendMessage({
                event:  'create btc script',
                data: {
                  scriptValues: btcScriptValues,
                  btcScriptCreatingTransactionHash: txID,
                }
              })
            })

            flow.swap.room.sendMessage({
              event: 'create btc script',
              data: {
                scriptValues : btcScriptValues,
                btcScriptCreatingTransactionHash : txID,
              }
            })
          }

          const { sellAmount } = flow.swap
          const { isBalanceEnough, btcScriptValues } = flow.state

          if (isBalanceEnough) {
            await flow.btcSwap.fundScript({
              scriptValues: btcScriptValues,
              amount: sellAmount,
            })
          }

          const checkBTCScriptBalance = async () => {
            const { scriptAddress } = this.btcSwap.createScript(btcScriptValues)
            const unspents = await this.btcSwap.fetchUnspents(scriptAddress)

            if (unspents.length === 0) {
              return false
            }

            const txID = unspents[0].txid

            const balance = await this.btcSwap.getBalance(btcScriptValues)

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
              return await checkBTCScriptBalance()
            } else {
              stopRepeat()
            }
          })

          const { isStoppedSwap } = flow.state

          if (!isStoppedSwap) {
            flow.finishStep({
              isBtcScriptFunded: true,
            }, { step: 'lock-btc' })
          }
        },

        // 5. Wait participant creates ETH Contract

        async () => {
          flow.swap.room.sendMessage({
            event: 'request eth contract',
          })

          flow.swap.room.once('request btc script', () => {
            const { btcScriptValues, btcScriptCreatingTransactionHash } = flow.state

            flow.swap.room.sendMessage({
              event:  'create btc script',
              data: {
                scriptValues: btcScriptValues,
                btcScriptCreatingTransactionHash,
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
              ownerAddress: this.app.getParticipantEthAddress(flow.swap),
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
            ownerAddress: this.app.getParticipantEthAddress(flow.swap),
            secret,
          }

          const balanceCheckError = await flow.ethTokenSwap.checkBalance({
            ownerAddress: this.app.getParticipantEthAddress(flow.swap),
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
            const targetWallet = await flow.ethTokenSwap.getTargetWallet(
              this.app.getParticipantEthAddress(flow.swap)
            )
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
            ownerAddress: this.app.getParticipantEthAddress(flow.swap),
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

      /* Secret hash generated - create BTC script - and only after this notify other part */
      this.createWorkBTCScript(secretHash);

      const _secret = `0x${secret.replace(/^0x/, '')}`

      this.finishStep({
        secret: _secret,
        secretHash,
      }, { step: 'submit-secret' })
    }

    getBTCScriptAddress() {
      const { scriptAddress } = this.state
      return scriptAddress;
    }

    createWorkBTCScript(secretHash) {
      if (this.state.btcScriptValues) {
        debug('swap.core:flow')('BTC Script already generated', this.state.btcScriptValues);
        return;
      }
      const { participant } = this.swap

      const utcNow = () => Math.floor(Date.now() / 1000)
      const getLockTime = () => utcNow() + 60 * 60 * 3 // 3 hours from now

      const scriptValues = {
        secretHash: secretHash,
        ownerPublicKey: this.app.services.auth.accounts.btc.getPublicKey(),
        recipientPublicKey: participant.btc.publicKey,
        lockTime: getLockTime(),
      }
      const { scriptAddress } = this.btcSwap.createScript(scriptValues)

      this.setState({
        scriptAddress: scriptAddress,
        btcScriptValues: scriptValues,
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

      const btcAddress = this.app.services.auth.accounts.btc.getAddress()

      const txFee = await this.btcSwap.estimateFeeValue({ method: 'swap', fixed: true, address: btcAddress })
      const unspents = await this.btcSwap.fetchUnspents(btcAddress)
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
      this.btcSwap.getRefundHexTransaction({
        scriptValues: this.state.btcScriptValues,
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
      const { btcScriptValues, secret } = flow.state

      return flow.btcSwap.refund({
        scriptValues: btcScriptValues,
        secret: secret,
      })
        .then((hash) => {
          if (!hash) {
            return false
          }

          this.swap.room.sendMessage({
            event: 'btc refund completed',
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
            console.warn('Btc refund:', error)

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
        if (await this.btcSwap.checkTX(refundTransactionHash)) {
          return true
        } else {
          console.warn('BTC2ETHTOKEN - unknown refund transaction')
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
        ownerAddress: this.app.getParticipantEthAddress(this.swap),
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

  return BTC2ETHTOKEN
}

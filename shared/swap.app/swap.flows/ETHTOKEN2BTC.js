import SwapApp from 'swap.app'
import { Flow } from 'swap.swap'


class ETHTOKEN2BTC extends Flow {

  constructor(swap) {
    super(swap)

    this.ethTokenSwap = SwapApp.swaps.ethTokenSwap
    this.btcSwap      = SwapApp.swaps.btcSwap

    if (!this.ethTokenSwap) {
      throw new Error('ETHTOKEN2BTC: "ethTokenSwap" of type object required')
    }
    if (!this.btcSwap) {
      throw new Error('ETHTOKEN2BTC: "btcSwap" of type object required')
    }

    this.state = {
      step: 0,

      signTransactionHash: null,
      isSignFetching: false,
      isMeSigned: false,

      secretHash: null,
      btcScriptValues: null,

      btcScriptVerified: false,

      isBalanceFetching: false,
      isBalanceEnough: false,
      balance: null,

      ethSwapCreationTransactionHash: null,
      isEthContractFunded: false,

      secret: null,
      isEthClosed: false,

      isEthWithdrawn: false,
      isBtcWithdrawn: false,

      refundTransactionHash: null,
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

      // 1. Sign swap to start

      () => {
        // this.sign()
      },

      // 2. Wait participant create, fund BTC Script

      () => {
        flow.swap.room.once('create btc script', ({ scriptValues }) => {
          flow.finishStep({
            secretHash: scriptValues.secretHash,
            btcScriptValues: scriptValues,
          })
        })
      },

      // 3. Verify BTC Script

      () => {
        // this.verifyBtcScript()
      },

      // 4. Check balance

      () => {
        this.syncBalance()
      },

      // 5. Create ETH Contract

      async () => {
        const { participant, buyAmount, sellAmount } = flow.swap

        // TODO move this somewhere!
        const utcNow = () => Math.floor(Date.now() / 1000)
        const getLockTime = () => utcNow() + 3600 * 1 // 1 hour from now

        const scriptCheckResult = await flow.btcSwap.checkScript(flow.state.btcScriptValues, {
          value: buyAmount,
          recipientPublicKey: SwapApp.services.auth.accounts.btc.getPublicKey(),
          lockTime: getLockTime(),
        })

        if (scriptCheckResult) {
          console.error(`Btc script check error:`, scriptCheckResult)
          flow.swap.events.dispatch('btc script check error', scriptCheckResult)
          return
        }

        const swapData = {
          participantAddress:   participant.eth.address,
          secretHash:           flow.state.secretHash,
          amount:               sellAmount,
        }

        await flow.ethTokenSwap.approve({
          amount: sellAmount,
        })

        await flow.ethTokenSwap.create(swapData, (hash) => {
          flow.setState({
            ethSwapCreationTransactionHash: hash,
          })
        })

        flow.swap.room.sendMessage('create eth contract')

        flow.finishStep({
          isEthContractFunded: true,
        })
      },

      // 6. Wait participant withdraw

      () => {
        const { participant } = flow.swap
        let timer

        const checkSecretExist = () => {
          timer = setTimeout(async () => {
            let secret

            try {
              secret = await flow.ethTokenSwap.getSecret({
                participantAddress: participant.eth.address,
              })
            }
            catch (err) {}

            if (secret) {
              if (!flow.state.isEthWithdrawn) { // redundant condition but who cares :D
                flow.finishStep({
                  isEthWithdrawn: true,
                  secret,
                })
              }
            }
            else {
              checkSecretExist()
            }
          }, 20 * 1000)
        }

        checkSecretExist()

        flow.swap.room.once('finish eth withdraw', () => {
          if (!flow.state.isEthWithdrawn) {
            clearTimeout(timer)
            timer = null

            flow.finishStep({
              isEthWithdrawn: true,
            })
          }
        })
      },

      // 7. Withdraw

      async () => {
        const { participant } = flow.swap
        let { secret, isEthClosed } = flow.state

        const data = {
          participantAddress: participant.eth.address,
        }

        // if there is no secret in state then request it
        if (!secret) {
          try {
            secret = await flow.ethTokenSwap.getSecret(data)

            flow.setState({
              secret,
            })
          }
          catch (err) {
            // TODO notify user that smth goes wrong
            console.error(err)
            return
          }
        }

        // if there is still no secret stop withdraw
        if (!secret) {
          console.error(`Secret required! Got ${secret}`)
          return
        }

        if (!isEthClosed) {
          try {
            await flow.ethTokenSwap.close(data)

            flow.setState({
              isEthClosed: true,
            })
          }
          catch (err) {
            // TODO notify user that smth goes wrong
            console.error(err)
            return
          }
        }

        await flow.btcSwap.withdraw({
          scriptValues: flow.state.btcScriptValues,
          secret,
        }, (hash) => {
          flow.setState({
            btcSwapWithdrawTransactionHash: hash,
          })
        })

        flow.finishStep({
          isBtcWithdrawn: true,
        })
      },

      // 8. Finish

      () => {

      },
    ]
  }

  async sign() {
    const { participant } = this.swap

    this.setState({
      isSignFetching: true,
    })

    await this.ethTokenSwap.sign(
      {
        participantAddress: participant.eth.address,
      },
      (hash) => {
        this.setState({
          hash,
        })
      }
    )

    this.swap.room.sendMessage('swap sign')

    this.finishStep({
      isMeSigned: true,
    })
  }

  verifyBtcScript() {
    this.finishStep({
      btcScriptVerified: true,
    })
  }

  async syncBalance() {
    const { sellAmount } = this.swap

    this.setState({
      isBalanceFetching: true,
    })

    const balance = await this.ethTokenSwap.fetchBalance(SwapApp.services.auth.accounts.eth.address)
    const isEnoughMoney = sellAmount.isLessThanOrEqualTo(balance)

    if (isEnoughMoney) {
      this.finishStep({
        balance,
        isBalanceFetching: false,
        isBalanceEnough: true,
      })
    }
    else {
      this.setState({
        balance,
        isBalanceFetching: false,
        isBalanceEnough: false,
      })
    }
  }

  async tryRefund() {
    const { participant } = this.swap
    let { secret, btcScriptValues } = this.state

    secret = 'c0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078'

    try {
      console.log('TRYING REFUND!')

      try {
        await this.ethTokenSwap.refund({
          participantAddress: participant.eth.address,
        }, (hash) => {
          this.setState({
            refundTransactionHash: hash,
          })
        })

        console.log('SUCCESS REFUND!')
        return
      }
      catch (err) {
        console.err('REFUND FAILED!', err)
      }
    }
    catch (err) {
      console.error(`Mbe it's still under lockTime?! ${err}`)
    }

    if (!btcScriptValues) {
      console.error('You can\'t do refund w/o btc script values! Try wait until lockTime expires on eth contract!')
    }

    if (!secret) {
      try {
        secret = await this.ethTokenSwap.getSecret(data)
      }
      catch (err) {
        console.error('Can\'t receive secret from contract')
        return
      }
    }

    console.log('TRYING WITHDRAW!')

    try {
      await this.btcSwap.withdraw({
        scriptValues: this.state.btcScriptValues,
        secret,
      }, (hash) => {
        this.setState({
          btcSwapWithdrawTransactionHash: hash,
        })
      })

      console.log('SUCCESS WITHDRAW!')
    }
    catch (err) {
      console.error('WITHDRAW FAILED!', err)
    }
  }
}


export default ETHTOKEN2BTC

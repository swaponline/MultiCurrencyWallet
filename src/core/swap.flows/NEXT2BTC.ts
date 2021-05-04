import debug from 'debug'
import crypto from 'bitcoinjs-lib/src/crypto' // move to BtcSwap
import SwapApp, { constants } from 'swap.app'
import COIN_DATA from 'swap.app/constants'
import { Flow, stepsForCoins } from 'swap.swap'

const fromCoin = constants.COIN_DATA.NEXT
const toCoin = constants.COIN_DATA.BTC

class NEXT2BTC extends Flow {

  _flowName: string
  nextSwap: any
  btcSwap: any
  state: any

  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }
  static getFromName() {
    return fromCoin.ticker
  }
  static getToName() {
    return toCoin.ticker
  }
  constructor(swap) {
    super(swap)

    this._flowName = NEXT2BTC.getName()

    // todo: remove for all flows
    /*
    this.stepNumbers = {
      'sign': 1,
      'wait-lock-btc': 2,
      'verify-script': 3,
      'sync-balance': 4,
      'lock-utxo': 5,
      'wait-withdraw-next': 6, // aka getSecret
      'withdraw-btc': 7,
      'finish': 8,
      'end': 9
    }
    */
    this.stepNumbers = stepsForCoins(fromCoin, toCoin)

    this.nextSwap = swap.participantSwap
    this.btcSwap = swap.ownerSwap

    if (!this.nextSwap) {
      throw new Error('BTC2NEXT: "nextSwap" of type object required')
    }
    if (!this.btcSwap) {
      throw new Error('BTC2NEXT: "btcSwap" of type object required')
    }

    this.state = {
      step: 0,

      signTransactionHash: null,
      isSignFetching: false,
      isMeSigned: false,

      secretHash: null,
      btcScriptValues: null,
      nextScriptValues: null,

      btcScriptVerified: false,

      isBalanceFetching: false,
      isBalanceEnough: false,
      balance: null,

      btcScriptCreatingTransactionHash: null,
      nextSwapCreationTransactionHash: null,

      isNextScriptFunded: false,

      secret: null,

      isNextWithdrawn: false,
      isbtcWithdrawn: false,

      refundTransactionHash: null,
      isRefunded: false,

      isFinished: false,
      isSwapExist: false,
    }

    this._persistState()
    super._persistSteps()
  }

  _persistState() {
    super._persistState()
  }

  //@ts-ignore: strictNullChecks
  _getSteps() {
    const flow = this

    return [

      // 1. Sign swap to start

      () => {
        // this.sign()
      },

      // 2. Wait participant create, fund BTC Script

      () => {
        flow.swap.room.once('create btc script', ({ scriptValues, btcScriptCreatingTransactionHash }) => {
          flow.finishStep({
            secretHash: scriptValues.secretHash,
            btcScriptValues: scriptValues,
            btcScriptCreatingTransactionHash,
          }, { step: 'wait-lock-btc', silentError: true })
        })

        flow.swap.room.sendMessage({
          event: 'request btc script',
        })
      },

      // 3. Verify BTC Script

      () => {
        debug('swap.core:flow')(`waiting verify btc script`)
        // this.verifyBtcScript()
      },

      // 4. Check balance

      () => {
        this.syncBalance()
        debug('swap.core:flow')(this)
      },

      // 5. Create Next Script

      async () => {
        const { participant, buyAmount, sellAmount } = flow.swap
        let nextSwapCreationTransactionHash

        // TODO move this somewhere!
        const utcNow = () => Math.floor(Date.now() / 1000)
        const getLockTime = () => utcNow() + 3600 * 1 // 1 hour from now

        const scriptCheckResult = await flow.btcSwap.checkScript(flow.state.btcScriptValues, {
          value: buyAmount,
          //@ts-ignore: strictNullChecks
          recipientPublicKey: this.app.services.auth.accounts.btc.getPublicKey(),
          lockTime: getLockTime(),
        })

        if (scriptCheckResult) {
          console.error(`Btc script check error:`, scriptCheckResult)
          flow.swap.events.dispatch('btc script check error', scriptCheckResult)
          return
        }

        const scriptValues = {
          secretHash:         flow.state.secretHash,
          //@ts-ignore: strictNullChecks
          ownerPublicKey:     this.app.services.auth.accounts.next.getPublicKey(),
          recipientPublicKey: participant.next.publicKey,
          lockTime:           getLockTime(),
        }

        try {
          await flow.nextSwap.fundScript({
            scriptValues,
            amount: sellAmount,
          }, (hash) => {
            nextSwapCreationTransactionHash = hash
            flow.setState({
              nextSwapCreationTransactionHash: hash,
            })
          })
        } catch (err) {
          // TODO user can stuck here after page reload...
          if ( /known transaction/.test(err.message) )
            return console.error(`known tx: ${err.message}`)
          else if ( /out of gas/.test(err.message) )
            return console.error(`tx failed (wrong secret?): ${err.message}`)
          else
            return console.error(err)
        }

        flow.swap.room.on('request next script', () => {
          flow.swap.room.sendMessage({
            event: 'create next script',
            data: {
              scriptValues,
              nextSwapCreationTransactionHash,
            }
          })
        })

        flow.swap.room.sendMessage({
          event: 'create next script',
          data: {
            scriptValues,
            nextSwapCreationTransactionHash,
          }
        })

        flow.finishStep({
          isNextScriptFunded: true,
          nextScriptValues: scriptValues,
        }, { step: 'lock-utxo' })
      },

      // 6. Wait participant withdraw

      () => {

        flow.swap.room.once('nextWithdrawTxHash', async ({ nextSwapWithdrawTransactionHash }) => {
          flow.setState({
            nextSwapWithdrawTransactionHash,
          })

          const secret = await flow.nextSwap.getSecretFromTxhash(nextSwapWithdrawTransactionHash)

          if (!flow.state.isNextWithdrawn && secret) {
            flow.finishStep({
              isNextWithdrawn: true,
              secret,
            }, { step: 'wait-withdraw-next' })
          }
        })

        flow.swap.room.sendMessage({
          event: 'request nextWithdrawTxHash',
        })
      },

      // 7. Withdraw

      async () => {
        let { secret, btcScriptValues } = flow.state

        if (!btcScriptValues) {
          console.error('There is no "btcScriptValues" in state. No way to continue swap...')
          return
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
          isbtcWithdrawn: true,
        }, { step: 'withdraw-btc' })
      },

      // 8. Finish

      () => {
        flow.swap.room.sendMessage({
          event: 'swap finished',
        })

        flow.finishStep({
          isFinished: true,
        }, { step: 'finish' })
      },

      // 9. Finished!
      () => {

      }
    ]
  }

  _checkSwapAlreadyExists() {
    const { participant } = this.swap

    const swapData = {
      //@ts-ignore: strictNullChecks
      ownerAddress:       this.app.services.auth.accounts.next.address,
      participantAddress: participant.next.address
    }

    return false//this.nextSwap.checkSwapExists(swapData)
  }

  async sign() {
    const swapExists = await this._checkSwapAlreadyExists()

    if (swapExists) {
      this.swap.room.sendMessage({
        event: 'swap exists',
      })

      this.setState({
        isSwapExist: true,
      })
    } else {
      this.setState({
        isSignFetching: true,
      })

      this.swap.room.on('request sign', () => {
        this.swap.room.sendMessage({
          event: 'swap sign',
        })
      })

      this.swap.room.sendMessage({
        event: 'swap sign',
      })

      this.finishStep({
        isMeSigned: true,
      }, { step: 'sign', silentError: true })

      return true
    }
  }


  verifyBtcScript() {
    if (this.state.btcScriptVerified) {
      return true
    }
    if (!this.state.btcScriptValues) {
      throw new Error(`No script, cannot verify`)
    }

    this.finishStep({
      btcScriptVerified: true,
    }, { step: 'verify-script' })

    return true
  }

  async syncBalance() {
    const { sellAmount } = this.swap

    this.setState({
      isBalanceFetching: true,
    })

    //@ts-ignore: strictNullChecks
    const balance = await this.nextSwap.fetchBalance(this.app.services.auth.accounts.next.getAddress())

    const isEnoughMoney = sellAmount.isLessThanOrEqualTo(balance)

    if (isEnoughMoney) {
      this.finishStep({
        balance,
        isBalanceFetching: false,
        isBalanceEnough: true,
      }, { step: 'sync-balance' })
    } else {
      this.setState({
        balance,
        isBalanceFetching: false,
        isBalanceEnough: false,
      })
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
    return this.nextSwap.refund({
      scriptValues: this.state.nextScriptValues,
      secret: this.state.secret,
    }, (hash) => {
      this.setState({
        refundTransactionHash: hash,
        isRefunded: true,
      })
    })
      .then(() => {
        this.swap.room.sendMessage({
          event: 'refund completed',
        })

        this.setState({
          isSwapExist: false,
        })
      })
  }

  async isRefundSuccess() {
    return true
  }

  async tryWithdraw(_secret) {
    const { secret, secretHash, isNextWithdrawn, isbtcWithdrawn, btcScriptValues } = this.state
    if (!_secret)
      throw new Error(`Withdrawal is automatic. For manual withdrawal, provide a secret`)

    if (!btcScriptValues)
      throw new Error(`Cannot withdraw without script values`)

    if (secret && secret != _secret)
      console.warn(`Secret already known and is different. Are you sure?`)

    if (isbtcWithdrawn)
      console.warn(`Looks like money were already withdrawn, are you sure?`)

    debug('swap.core:flow')(`WITHDRAW using secret = ${_secret}`)

    const _secretHash = crypto.ripemd160(Buffer.from(_secret, 'hex')).toString('hex')
    if (secretHash != _secretHash)
      console.warn(`Hash does not match!`)

    const { scriptAddress } = this.btcSwap.createScript(btcScriptValues)
    const balance = await this.btcSwap.getBalance(scriptAddress)

    debug('swap.core:flow')(`address=${scriptAddress}, balance=${balance}`)

    if (balance === 0) {
      this.finishStep({
        isbtcWithdrawn: true,
      }, { step: 'withdraw-btc' })
      throw new Error(`Already withdrawn: address=${scriptAddress},balance=${balance}`)
    }

    await this.btcSwap.withdraw({
      scriptValues: btcScriptValues,
      secret: _secret,
    }, (hash) => {
      debug('swap.core:flow')(`TX hash=${hash}`)
      this.setState({
        btcSwapWithdrawTransactionHash: hash,
      })
    })
    debug('swap.core:flow')(`TX withdraw sent: ${this.state.btcSwapWithdrawTransactionHash}`)

    this.finishStep({
      isbtcWithdrawn: true,
    }, { step: 'withdraw-btc' })
  }

}


export default NEXT2BTC

import debug from 'debug'
import SwapApp, { util } from 'swap.app'
import Flow from './Flow'


class AtomicAB2UTXO extends Flow {

  utxoCoin: string = null
  isUTXOSide: boolean = false

  abBlockchain: any // @to-do - make inmlementation for ABswap
  utxoBlockchain: any // @to-do - make implementation for UTXOSwap


  constructor(swap) {
    super(swap)

    this.state = {
      ...this.state,
      ...{
        /** AB-UTXO **/
        // Partical (btc-seller) has unconfirmed txs in mempool
        participantHasLockedUTXO: false,
        requireWithdrawFee: false,
        requireWithdrawFeeSended: false,
        // Script charged, confirmed and checked - next step - charge AB contract
        isUTXOScriptOk: false,
        utxoScriptValues: null,
        utxoScriptVerified: false,
        utxoScriptCreatingTransactionHash: null,
        /** UTXO-AB **/
        // We are have locked txs in mem-pool
        waitUnlockUTXO: false,
        utxoFundError: null,
        withdrawRequestAccepted: false,
      },
    }
  }

  signABSide() {
    this.swap.processMetamask()
  }

  signUTXOSide() {
    this.swap.processMetamask()
    this.swap.room.once('swap sign', () => {
      const { step } = this.state

      if (step >= 2) {
        return
      }

      this.swap.room.once('eth refund completed', () => {
        this.tryRefund()
      })

      this.finishStep({
        isParticipantSigned: true,
      }, { step: 'sign', silentError: true })
    })

    this.swap.room.once('swap exists', () => {
      this.setState({
        isSwapExist: true,
      })

      this.stopSwapProcess()
    })

    this.swap.room.sendMessage({
      event: 'request sign',
    })
  }

  waitUTXOScriptCreated() {
    const flow = this
    this.swap.room.on('create utxo script', ({ scriptValues, utxoScriptCreatingTransactionHash }) => {
      const { step } = flow.state

      if (step >= 3) {
        return
      }

      flow.finishStep({
        secretHash: scriptValues.secretHash,
        utxoScriptValues: scriptValues,
        utxoScriptCreatingTransactionHash,
      }, { step: 'wait-lock-utxo', silentError: true })
    })

    this.swap.room.sendMessage({
      event: 'request utxo script',
    })
  }

  async waitUTXOScriptFunded(): Promise<boolean> {
    const {
      isUTXOScriptOk: isFunded,
    } = this.state
    if (isFunded) return true

    const flow = this
    const {
      participant,
      buyAmount,
      sellAmount,
      waitConfirm,
    } = flow.swap

    const { secretHash } = this.state

    const utcNow = () => Math.floor(Date.now() / 1000)

    const isUTXOScriptOk = await util.helpers.repeatAsyncUntilResult(async (stopRepeat) => {
      const {
        utxoScriptValues,
      } = flow.state


      const scriptCheckError = await this[`${this.utxoCoin}Swap`].checkScript(utxoScriptValues, {
        value: buyAmount,
        recipientPublicKey: this.app.services.auth.accounts[this.utxoCoin].getPublicKey(),
        lockTime: utcNow(),
        confidence: 0.8,
        isWhiteList: this.app.isWhitelistBtc(participant.btc.address), // @todo - may be need more white list coins
        waitConfirm,
      })

      if (scriptCheckError) {
        if (/Expected script lockTime/.test(scriptCheckError)) {
          console.error(`${this.utxoCoin} script check error: ${this.utxoCoin} was refunded`, scriptCheckError)
          flow.stopSwapProcess()
          stopRepeat()
        } else if (/Expected script value/.test(scriptCheckError)) {
          console.warn(`${this.utxoCoin} script check: waiting balance`)
        } else if (
          /Can be replace by fee. Wait confirm/.test(scriptCheckError)
          ||
          /Wait confirm tx/.test(scriptCheckError)
        ) {
          flow.swap.room.sendMessage({
            event: `wait ${this.utxoCoin} confirm`,
            data: {},
          })
        } else {
          this.swap.events.dispatch(`${this.utxoCoin} script check error`, scriptCheckError)
        }

        return false
      } else {
        return true
      }
    })

    if (!isUTXOScriptOk) {
      return false
    } else {
      flow.setState({
        isUTXOScriptOk,
      }, true)
      return true
    }
  }

  getScriptValues() {
    return this.state.utxoScriptValues
  }

  verifyScript() {
    const { utxoScriptVerified, utxoScriptValues } = this.state

    if (utxoScriptVerified) {
      return true
    }

    if (!utxoScriptValues) {
      throw new Error(`No script, cannot verify`)
    }

    this.finishStep({
      utxoScriptVerified: true,
    }, { step: 'verify-script' })

    return true
  }

  getScriptCreateTx() {
    const {
      utxoScriptCreatingTransactionHash,
    } = this.state
    return utxoScriptCreatingTransactionHash
  }

  tryRefund() {}

  _checkSwapAlreadyExists() {}

  async sign() {
    const swapExists = await this._checkSwapAlreadyExists()

    if (swapExists) {
      this.swap.room.sendMessage({
        event: 'swap exists',
      })

      this.setState({
        isSwapExist: true,
      })

      this.stopSwapProcess()
    } else {
      const { isSignFetching, isMeSigned } = this.state

      if (isSignFetching || isMeSigned) {
        return true
      }

      this.setState({
        isSignFetching: true,
      })

      this.swap.room.once('utxo refund completed', () => {
        this.tryRefund()
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

        await this.abBlockchain.withdrawNoMoney(data, (hash) => {
          flow.swap.room.sendMessage({
            event: 'withdraw ready',
            data: {
              ethSwapWithdrawTransactionHash: hash,
            }
          })
        })
      } catch (err) {
        debug('swap.core:flow')(err.message)
      }
    })

    this.swap.room.sendMessage({
      event: 'accept withdraw request'
    })
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
}


export default AtomicAB2UTXO

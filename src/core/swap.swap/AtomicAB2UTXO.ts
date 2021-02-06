import debug from 'debug'
import SwapApp, { util } from 'swap.app'
import Flow from './Flow'
import { BigNumber } from 'bignumber.js'


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

  // This function call AB side in classic AB2UTXO without taker-maker model
  async checkOtherSideRefund() {
    if (typeof this.utxoBlockchain.checkWithdraw === 'function') {
      const { utxoScriptValues } = this.state
      if (utxoScriptValues) {
        const { scriptAddress } = this.utxoBlockchain.createScript(utxoScriptValues)

        const destinationAddress = this.swap.destinationBuyAddress
        const destAddress = (destinationAddress) ? destinationAddress : this.app.services.auth.accounts.btc.getAddress()

        const hasWithdraw = await this.utxoBlockchain.checkWithdraw(scriptAddress)
        if (hasWithdraw
          && hasWithdraw.address.toLowerCase() !== destAddress.toLowerCase()
        ) {
          return true
        }
      }
    }
    return false
  }

  submitSecret(secret) {
    if (this.state.secret) { return }

    if (!this.state.isParticipantSigned) {
      throw new Error(`Cannot proceed: participant not signed. step=${this.state.step}`)
    }

    const secretHash = this.app.env.bitcoin.crypto.ripemd160(Buffer.from(secret, 'hex')).toString('hex')

    /* Secret hash generated - create BTC script - and only after this notify other part */
    this.createWorkUTXOScript(secretHash);

    const _secret = `0x${secret.replace(/^0x/, '')}`

    this.finishStep({
      secret: _secret,
      secretHash,
    }, { step: 'submit-secret' })
  }

  createWorkUTXOScript(secretHash) {
    if (this.state.utxoScriptValues) {
      debug('swap.core:flow')('BTC Script already generated', this.state.utxoScriptValues)
      return
    }

    const { participant } = this.swap

    const utcNow = () => Math.floor(Date.now() / 1000)
    const getLockTime = () => utcNow() + 60 * 60 * 3 // 3 hours from now

    const scriptValues = {
      secretHash:         secretHash,
      ownerPublicKey:     this.app.services.auth.accounts[this.utxoCoin].getPublicKey(),
      recipientPublicKey: participant[this.utxoCoin].publicKey,
      lockTime:           getLockTime(),
    }
    const { scriptAddress } = this.utxoBlockchain.createScript(scriptValues)

    this.setState({
      scriptAddress: scriptAddress,
      utxoScriptValues: scriptValues,
      scriptBalance: 0,
      scriptUnspendBalance: 0
    })
  }

  async syncBalance(): Promise<void> {
    return (this.isUTXOSide)
      ? this.syncBalanceUTXO()
      : this.syncBalanceAB()
  }

  async syncBalanceAB(): Promise<void> {
    const { sellAmount } = this.swap

    this.setState({
      isBalanceFetching: true,
    })

    const balance = await this.abBlockchain.fetchBalance(
      this.app.getMyEthAddress()
    )
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

  async syncBalanceUTXO(): Promise<void> {
    const { sellAmount } = this.swap

    this.setState({
      isBalanceFetching: true,
    })

    const utxoAddress = this.app.services.auth.accounts[this.utxoCoin].getAddress()

    const txFee = await this.utxoBlockchain.estimateFeeValue({ method: 'swap', fixed: true, address: utxoAddress })
    const unspents = await this.utxoBlockchain.fetchUnspents(utxoAddress)
    const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
    const balance = new BigNumber(totalUnspent).dividedBy(1e8)

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

  // @to-do - not used in code - front/bot - (btc/ghost/next) - may be need deleted
  // dot with comma in original - say - its artefact....
  getUtxoScriptAddress() {
    const { scriptAddress } = this.state
    return scriptAddress
  }
}


export default AtomicAB2UTXO

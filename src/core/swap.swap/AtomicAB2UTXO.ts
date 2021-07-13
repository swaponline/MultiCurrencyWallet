import debug from 'debug'
import SwapApp, { util } from 'swap.app'
import Flow from './Flow'
import { BigNumber } from 'bignumber.js'
import * as cryptoLib from 'crypto'


class AtomicAB2UTXO extends Flow {

  //@ts-ignore: strictNullChecks
  utxoCoin: string = null
  isUTXOSide: boolean = false

  abBlockchain: any // @to-do - make inmlementation for ABswap
  utxoBlockchain: any // @to-do - make implementation for UTXOSwap


  constructor(swap) {
    super(swap)

    //@ts-ignore: strictNullChecks
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

  setupTakerMakerEvents() {
    const flow = this
    if (!this.isTakerMakerModel) return
    if (this.isTaker()) {
      flow.swap.room.on('request utxo script', () => {
        const {
          utxoScriptValues,
          secretHash,
          secret,
        } = flow.state
        if (secret && secretHash) {
          flow.swap.room.sendMessage({
            event: 'utxo script generated',
            data: {
              utxoScriptValues,
              secretHash,
            }
          })
        }
      })
    } else {
      flow.swap.room.on('utxo script generated', (data) => {
        const {
          utxoScriptValues,
          secretHash,
        } = data

        flow.setState({
          utxoScriptValues,
          secretHash,
        }, true)
      })
    }
  }

  getStepNumbers() {
    switch (true) {
      case ( // Это не модель taker-maker - сторона utxo, или это taker-maker, сторона utxo, и это taker (создает первый utxo скрипт)
        (!this.isTakerMakerModel && this.isUTXOSide)
        ||
        (this.isTakerMakerModel && this.isUTXOSide && this.isTaker())
      ): return {
          'sign': 1,
          'submit-secret': 2,
          'sync-balance': 3,
          'lock-utxo': 4,
          'wait-lock-eth': 5,
          'withdraw-eth': 6,
          'finish': 7,
          'end': 8,
        }
      case ( // Это не модель taker-maker - сторона ab, или это taker-maker, сторона ab, и это maker (ждет создание utxo скрипта)
        (!this.isTakerMakerModel && !this.isUTXOSide)
        ||
        (this.isTakerMakerModel && !this.isUTXOSide && this.isMaker())
      ): return {
          'sign': 1,
          'wait-lock-utxo': 2,
          'verify-script': 3,
          'sync-balance': 4,
          'lock-eth': 5,
          'wait-withdraw-eth': 6, // aka getSecret
          'withdraw-utxo': 7,
          'finish': 8,
          'end': 9,
        }
      case ( // Это модель taker-maker, сторона ab, мы taker - создаем контракт ab
        this.isTakerMakerModel && !this.isUTXOSide && this.isTaker()
      ): return {
          'sign': 1,
          'sync-balance': 2,
          'lock-eth': 3,
          'wait-lock-utxo': 4,
          'withdraw-utxo': 5,
          'finish': 6,
          'end': 7,
        }
      case ( // Это модель taker-maker, сторона utxo, мы maker - ждем создание контракта ab
        this.isTakerMakerModel && this.isUTXOSide && this.isMaker()
      ): return {
          'sign': 1,
          'sync-balance': 2,
          'wait-lock-eth': 3,
          'lock-utxo': 4,
          'wait-withdraw-utxo': 5,
          'withdraw-eth': 6,
          'finish': 7,
          'end': 8,
        }
    }
  }

  async signABSide() {
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

  async signUTXOSide() {
    this.swap.processMetamask()
    this.swap.room.once('swap sign', () => {
      const { step } = this.state

      if (step >= 2) {
        return
      }

      this.swap.room.once('eth refund completed', () => {
        this.tryRefund()
      })

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


      const scriptCheckError = await this.utxoBlockchain.checkScript(utxoScriptValues, {
        value: buyAmount,
        //@ts-ignore: strictNullChecks
        recipientPublicKey: this.app.services.auth.accounts[this.utxoCoin].getPublicKey(),
        lockTime: utcNow(),
        confidence: 0.8,
        isWhiteList: this.app.isWhitelistBtc(participant.btc.address), // @todo - may be need more white list coins
        waitConfirm,
      })

      if (scriptCheckError) {
        if (/Expected script lockTime/.test(scriptCheckError)) {
          console.error(`${this.utxoCoin} script check error: ${this.utxoCoin} was refunded`, scriptCheckError)
          console.log('>>>>> STOP SWAP PROCESS - FAIL CHECK SCRIPT LOCK TIME')
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

  //tryRefund(): Promise<any> {}

  _checkSwapAlreadyExists() {
    // mock
    // todo: implement
    return new Promise((resolve, reject) => {
      resolve(false)
    })
  }

  async sign() {
    const { isSignFetching, isMeSigned } = this.state

    if (isSignFetching || isMeSigned) {
      return true
    }

    const swapExists = await this._checkSwapAlreadyExists()

    if (swapExists) {
      this.swap.room.sendMessage({
        event: 'swap exists',
      })

      this.setState({
        isSwapExist: true,
      })

      console.log('>>>>> STOP SWAP PROCESS - SWAP EXIST ON SIGN')
      this.stopSwapProcess()
    } else {

      this.setState({
        isSignFetching: true,
      })

      if (!this.isTakerMakerModel) {
        this.swap.room.once('utxo refund completed', () => {
          this.tryRefund()
        })
      }

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
        //@ts-ignore: strictNullChecks
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

  generateSecret() {
    const secret = cryptoLib.randomBytes(32).toString('hex')
    const secretHash = this.app.env.bitcoin.crypto.ripemd160(Buffer.from(secret, 'hex')).toString('hex')
    const _secret = `0x${secret.replace(/^0x/, '')}`

    return {
      secret,
      secretHash,
    }
  }

  submitSecret() {
    const {
      isParticipantSigned,
    } = this.state
    // @to-do - check destinationBuyAddress
    if (this.state.secret) { return }
    if (isParticipantSigned) {
      const {
        secret,
        secretHash,
      } = this.generateSecret()

      /* Secret hash generated - create BTC script - and only after this notify other part */
      this.createWorkUTXOScript(secretHash);
      this.finishStep({
        secret,
        secretHash,
      }, { step: 'submit-secret' })
    } else {
      if (!this.state.isParticipantSigned) {
        throw new Error(`Cannot proceed: participant not signed. step=${this.state.step}`)
      }
    }
  }

  createWorkUTXOScript(secretHash, isOwner = true) {
    if (this.state.utxoScriptValues) {
      debug('swap.core:flow')('BTC Script already generated', this.state.utxoScriptValues)
      return
    }

    const { participant } = this.swap

    const utcNow = () => Math.floor(Date.now() / 1000)
    const getLockTime = () => utcNow() + 60 * 60 * 3 // 3 hours from now

    const scriptValues = {
      secretHash:         secretHash,
      //@ts-ignore: strictNullChecks
      ownerPublicKey:     (isOwner) ? this.app.services.auth.accounts[this.utxoCoin].getPublicKey() : participant[this.utxoCoin].publicKey,
      //@ts-ignore: strictNullChecks
      recipientPublicKey: (isOwner) ? participant[this.utxoCoin].publicKey : this.app.services.auth.accounts[this.utxoCoin].getPublicKey(),
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

    //@ts-ignore: strictNullChecks
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

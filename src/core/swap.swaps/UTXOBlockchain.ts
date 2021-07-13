import debug from 'debug'
import SwapApp, { SwapInterface, constants, util } from 'swap.app'
import BigNumber from 'bignumber.js'
import { Flow } from 'swap.swap'


class UTXOBlockchain extends SwapInterface {
  //@ts-ignore: strictNullChecks
  _swapName: string = null
  //@ts-ignore: strictNullChecks
  fetchBalance: Function = undefined
  //@ts-ignore: strictNullChecks
  fetchUnspents: Function = undefined
  //@ts-ignore: strictNullChecks
  broadcastTx: Function = undefined
  //@ts-ignore: strictNullChecks
  checkWithdraw: Function = undefined
  feeValue: number = 546
  //@ts-ignore: strictNullChecks
  fetchTxInfo: Function = undefined
  //@ts-ignore: strictNullChecks
  estimateFeeValue: Function = undefined

  // Парсит транзакцию, извлекает скрипт для получения секрета
  // Нужна, если taker создает AB контракт первый, чтобы maker мог получить
  // секрет из транзакции к UTXO скрипту
  //@ts-ignore: strictNullChecks
  fetchTxInputScript: Function = undefined

  //@ts-ignore: strictNullChecks
  account: string = undefined
  networks: any = undefined
  network: any = undefined

  skipFetchConfidence: boolean = false
  skipCheckCanBeReplaces: boolean = false
  skipLockTime: boolean = false
  skipRecipientPublickKey: boolean = false

  //@ts-ignore: strictNullChecks
  processUnspent: Function = undefined
  sendTransaction: Function

  //@ts-ignore: strictNullChecks
  app: SwapApp = undefined
  /**
   *
   * @param options
   * @param options.fetchBalance
   * @param options.fetchUnspents
   * @param options.broadcastTx
   * @param options.fetchTxInfo {(tx_hash) => Promise({ confidence, fees })}
   * @param options.estimateFeeValue { ({ inSatoshis, speed, address, txSize }) => Promise(fee_value) }
   */
  constructor(options) {
    super()

    if (typeof options.fetchBalance !== 'function') {
      throw new Error('BtcSwap: "fetchBalance" required')
    }
    if (typeof options.fetchUnspents !== 'function') {
      throw new Error('BtcSwap: "fetchUnspents" required')
    }
    if (typeof options.broadcastTx !== 'function') {
      throw new Error('BtcSwap: "broadcastTx" required')
    }
    if (typeof options.fetchTxInfo !== 'function') {
      // tx_hash => { confidence, fees }
      console.warn(`BtcSwap: "fetchTxInfo" is not a function. You will not be able to use tx-confidence feature`)
    }
    if (typeof options.estimateFeeValue !== 'function') {
      // ({ speed } = {}) => feeRate
      console.warn(`BtcSwap: "estimateFeeValue" is not a function. You will not be able use automatic mempool-based fee`)
    }

    this._swapName      = options.swapName || constants.COINS.btc
    this.fetchBalance   = options.fetchBalance
    this.fetchUnspents  = options.fetchUnspents
    this.broadcastTx    = options.broadcastTx
    this.checkWithdraw  = options.checkWithdraw
    this.feeValue       = options.feeValue || 546
    this.fetchTxInfo    = options.fetchTxInfo || (() => {})
    this.estimateFeeValue = options.estimateFeeValue || (() => 0)

    // UTXO side is taker
    this.fetchTxInputScript = options.fetchTxInputScript || undefined

    this.account        = options.account || `btc`
    this.networks       = options.networks

    this.skipFetchConfidence = options.skipFetchConfidence || false
    this.skipCheckCanBeReplaces = options.skipCheckCanBeReplaces || false
    this.skipLockTime = options.skipLockTime || false
    this.skipRecipientPublickKey = options.skipRecipientPublickKey || false

    this.processUnspent = options.processUnspent || (
      (unspent) => {
        const { txid, vout } = unspent
        return { txid, vout }
      }
    )
    this.sendTransaction = options.sendTransaction
  }

  _initSwap(app) {
    super._initSwap(app)

    this.app = app

    /* init networks if need */
    const {
      main: {
        name: mainName,
        params: mainParams,
      },
      test: {
        name: testName,
        params: testParams,
      },
    } = this.networks

    if (mainName && mainParams) this.app.env.bitcoin.networks[mainName] = mainParams
    if (testName && testParams) this.app.env.bitcoin.networks[testName] = testParams

    this.network = (
      this.app.isMainNet()
        ? this.app.env.bitcoin.networks[mainName]
        : this.app.env.bitcoin.networks[testName]
    )
  }

  /**
   *
   * @param {object} options
   * @param {boolean} options.inSatoshis
   * @param {Number} options.size
   * @param {String} options.speed
   * @param {String} options.address
   * @param {String} options.swapUTXOMethod
   * @returns {BigNumber}
   * @public
   */
  async getTxFee({
    inSatoshis,
    size,
    speed = 'fast',
    address,
    swapUTXOMethod,
  }: {
    inSatoshis: boolean,
    size?: number,
    speed?: 'slow' | 'medium' | 'fast'
    address: string,
    swapUTXOMethod?: 'withdraw' | 'deposit'
  }) {


    const estimatedFeeRaw = await this.estimateFeeValue({
      inSatoshis: true,
      address,
      speed,
      method: 'swap',
      txSize: size,
      swapUTXOMethod,
    })

    const estimatedFee = new BigNumber(estimatedFeeRaw)
    this.feeValue = estimatedFee.toNumber()

    return inSatoshis
      ? estimatedFee
      : estimatedFee.dividedBy(1e8).dp(0, BigNumber.ROUND_UP)
  }

  /**
   *
   * @param {array} unspents
   * @param {Number} expectedConfidenceLevel
   * @returns {array}
   * @private
   */
  async filterConfidentUnspents(unspents, expectedConfidenceLevel = 0.95) {

    const feesToConfidence = async (fees, size, address) => {
      fees = new BigNumber(fees).multipliedBy(1e8).toNumber()
      const currentFastestFee = await this.getTxFee({ inSatoshis: true, size, speed: 'fast', address })

      return new BigNumber(fees).isLessThan(currentFastestFee)
        ? new BigNumber(fees).dividedBy(currentFastestFee).toNumber()
        : 1
    }

    /* @ToDo - больше гибкости */
    const fetchConfidence = async (unspent): Promise<number> => {


      if (this.skipFetchConfidence) return 1

      const {
        fees,
        size,
        senderAddress,
        confirmations: txConfirms,
      } = unspent

      const confirmationsToConfidence = confs => confs > 0 ? 1 : 0
      const confidenceFromConfirmations = confirmationsToConfidence(txConfirms)

      if (new BigNumber(confidenceFromConfirmations).isGreaterThanOrEqualTo(expectedConfidenceLevel)) {
        return confidenceFromConfirmations
      }

      try {
        if (txConfirms > 0) {
          return 1
        }

        if (fees) {
          const confFromFee = await feesToConfidence(fees, size, senderAddress)
          return confFromFee
        }

        throw new Error(`txinfo={confirmations: ${txConfirms}, fees: ${fees}, size: ${size}, senderAddress: ${senderAddress} }`)

      } catch (err) {
        console.error(`BtcSwap: Error fetching confidence: using confirmations > 0:`, err.message)

        return confidenceFromConfirmations
      }
    }

    const confidences: number[] = await Promise.all(unspents.map(fetchConfidence))

    return unspents.filter((utxo, index) => {
      debug('swap.core:swaps')(`confidence[${index}]:`, confidences[index])
      return new BigNumber(confidences[index]).isGreaterThanOrEqualTo(expectedConfidenceLevel)
    })
  }

  /**
   *
   * @param {Array[object]} unspents
   * @return {Array[object]}
   */
  async filterConfirmedUnspents(unspents): Promise<any[]> {
    return new Promise(async (resolve) => {
      const filtered = unspents.filter((unspent) => {
        const {
          confirmations,
        } = unspent

        if (confirmations > 0) {
          return true
        }
      })
      resolve(filtered)
    })
  }
  /**
   *
   * @param {object} data
   * @param {object} data.script
   * @param {*} data.txRaw
   * @param {string} data.secret
   * @param {number} inputIndex
   * @private
   */
  _signTransaction(data, inputIndex = 0) {
    debug('swap.core:swaps')('signing script input', inputIndex)
    const {
      script,
      txRaw,
      secret,
    } = data

    const scriptData = this.app.env.bitcoin.payments.p2sh({
      redeem: {
        output: script,
        network: this.network,
      },
      network: this.network,
    })

    const hashType      = this.app.env.bitcoin.Transaction.SIGHASH_ALL
    const privKey = this.app.env.bitcoin.ECPair.fromWIF(
      //@ts-ignore: strictNullChecks
      this.app.services.auth.accounts[this.account].getPrivateKey(),
      this.network
    )

    const signatureHash = txRaw.hashForSignature(inputIndex, scriptData.redeem.output, hashType)

    const redeemScriptSig = this.app.env.bitcoin.payments.p2sh({ 
      network: this.network, 
      redeem: { 
        network: this.network, 
        output: scriptData.redeem.output, 
        input: this.app.env.bitcoin.script.compile([ 
          this.app.env.bitcoin.script.signature.encode(privKey.sign(signatureHash), hashType),
          //@ts-ignore: strictNullChecks
          this.app.services.auth.accounts[this.account].getPublicKeyBuffer(),
          Buffer.from(secret.replace(/^0x/, ''), 'hex'),
        ]) 
      } 
    }).input 

    txRaw.setInputScript(inputIndex, redeemScriptSig)
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secretHash
   * @param {string} data.ownerPublicKey
   * @param {string} data.recipientPublicKey
   * @param {number} data.lockTime
   * @returns {{scriptAddress: *, script: (*|{ignored})}}
   */
  createScript(data, hashName = 'ripemd160') {
    const hashOpcodeName = `OP_${hashName.toUpperCase()}`
    const hashOpcode = this.app.env.bitcoin.opcodes[hashOpcodeName]

    const { secretHash, ownerPublicKey, recipientPublicKey, lockTime } = data

    const script = this.app.env.bitcoin.script.compile([

      this.app.env.bitcoin.opcodes.OP_SIZE,
      Buffer.from('20' ,'hex'),
      this.app.env.bitcoin.opcodes.OP_EQUALVERIFY,

      hashOpcode,
      Buffer.from(secretHash, 'hex'),
      this.app.env.bitcoin.opcodes.OP_EQUALVERIFY,

      Buffer.from(recipientPublicKey, 'hex'),
      this.app.env.bitcoin.opcodes.OP_EQUAL,
      this.app.env.bitcoin.opcodes.OP_IF,

      Buffer.from(recipientPublicKey, 'hex'),

      this.app.env.bitcoin.opcodes.OP_ELSE,

      this.app.env.bitcoin.script.number.encode(lockTime),
      this.app.env.bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
      this.app.env.bitcoin.opcodes.OP_DROP,
      Buffer.from(ownerPublicKey, 'hex'),

      this.app.env.bitcoin.opcodes.OP_ENDIF,

      this.app.env.bitcoin.opcodes.OP_CHECKSIG,
    ])

    const scriptData = this.app.env.bitcoin.payments.p2sh({
      redeem: {
        output: script,
        network: this.network,
      },
      network: this.network,
    })
    const scriptAddress = scriptData.address

    return {
      scriptAddress,
      script,
    }
  }

  fetchUnspentsFullInfo(scriptAddress): Promise<any[]> {
    return new Promise(async (resolve) => {
      const unspents      = await this.fetchUnspents(scriptAddress)
      const fetchFullUnspentInfo = async (unspent) => {
        try {
          const info = await this.fetchTxInfo(unspent.txid)
          return {
            ...unspent,
            ...info,
          }
        } catch (fetchTxInfoError) {
          return false
        }
      }

      const unspentsFullInfo = await Promise.all(unspents.map(fetchFullUnspentInfo))
      resolve(unspentsFullInfo.filter((unspent) => unspent !== false ))
    })
  }

  checkCanBeReplaces(unspents) {
    if (this.skipCheckCanBeReplaces) return false
    const notReplacedUnspents = unspents.filter((unspent) => {
      const notReplacedInputs = unspent.inputs.filter((input) => {
        return input.sequenceNumber.toString(16) === `ffffffff`
      })
      return notReplacedInputs.length === unspent.inputs.length
    })
    return !(notReplacedUnspents.length === unspents.length)
  }
  /**
   *
   * @param {object} data
   * @param {string} data.recipientPublicKey
   * @param {number} data.lockTime
   * @param {object} expected
   * @param {number} expected.value
   * @param {number} expected.lockTime
   * @param {string} expected.recipientPublicKey
   * @returns {Promise.<string>}
   */
  async checkScript(data, expected, hashName) {
    const { recipientPublicKey, lockTime } = data
    const { scriptAddress, script } = this.createScript(data, hashName)

    const {
      waitConfirm,
      isWhiteList
    } = expected

    if (isWhiteList) {
      console.log('is white listed - skip wait btc script')
      return
    }

    const expectedConfidence = (expected.confidence !== undefined) ? expected.confidence : 0.95

    const unspents: any[] = await this.fetchUnspentsFullInfo(scriptAddress)

    if (!unspents.length) return `No unspents. Wait`

    
    // Check - transaction can be replaced?
    const canBeReplaced = this.checkCanBeReplaces(unspents)
    if (canBeReplaced) {
      console.warn(`Fund to script ${scriptAddress} can be replaced be fee. Wait confirm`)
    }
    if (waitConfirm || canBeReplaced) {
      // Wait confirm only - for big amount of swap
      if (!unspents.length) return `No unspents`
      const confirmedUnspents: any[] = await this.filterConfirmedUnspents(unspents)
      if (unspents.length === confirmedUnspents.length) return
      await util.helpers.waitDelay(30)
      if (canBeReplaced) return `Can be replace by fee. Wait confirm`
      return `Wait confirm tx`
    }

    const expectedValue = expected.value.multipliedBy(1e8).integerValue()
    const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

    const confidentUnspents = await this.filterConfidentUnspents(unspents, expectedConfidence)

    const totalConfidentUnspent = confidentUnspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

    if (expectedValue.isGreaterThan(totalUnspent)) {
      return `Expected script value: ${expectedValue.toNumber()}, got: ${totalUnspent}, address: ${scriptAddress}`
    }
    if (!this.skipLockTime && expected.lockTime > lockTime) {
      return `Expected script lockTime: ${expected.lockTime}, got: ${lockTime}, address: ${scriptAddress}`
    }
    if (!this.skipRecipientPublickKey && expected.recipientPublicKey !== recipientPublicKey) {
      return `Expected script recipient publicKey: ${expected.recipientPublicKey}, got: ${recipientPublicKey}`
    }
    if (expectedValue.isGreaterThan(totalConfidentUnspent)) {
      return `Expected script value: ${expectedValue.toString()} with confidence above ${expectedConfidence}, got: ${totalConfidentUnspent}, address: ${scriptAddress}`
    }
  }

  /**
   *
   * @param {object} data
   * @param {object} data.scriptValues
   * @param {BigNumber} data.amount
   * @param {function} handleTransactionHash
   * @param {string} hashName
   * @returns {Promise}
   */
  fundScript(data, handleTransactionHash?: Function, hashName?: string) {
    const { scriptValues, amount } = data

    return new Promise(async (resolve, reject) => {
      try {
        const { scriptAddress } = this.createScript(scriptValues, hashName)

        const scriptBalance = await this.fetchBalance(scriptAddress)
        if (new BigNumber(scriptBalance).isGreaterThan(0)) {
          // Script already funded - skip double payments
          reject('Script funded already')
          return
        }

        //@ts-ignore: strictNullChecks
        const ownerAddress = this.app.services.auth.accounts[this.account].getAddress()

        const fundValue     = amount.multipliedBy(1e8).integerValue().toNumber()
        const tx            = new this.app.env.bitcoin.TransactionBuilder(this.network)
        const unspents      = await this.fetchUnspents(ownerAddress)
        const feeValueBN    = await this.getTxFee({ inSatoshis: true, address: ownerAddress })
        const feeValue      = feeValueBN.integerValue().toNumber()
        const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
        const skipValue     = totalUnspent - fundValue - feeValue

        if (totalUnspent < feeValue + fundValue) {
          throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue} + ${fundValue}`)
        }

        unspents.forEach((unspent) => {
          const { txid, vout } = this.processUnspent(unspent)
          tx.addInput(txid, vout, 0xffffffff)
        })
        tx.addOutput(scriptAddress, fundValue)
        //@ts-ignore: strictNullChecks
        tx.addOutput(this.app.services.auth.accounts[this.account].getAddress(), skipValue)

        const privKey = this.app.env.bitcoin.ECPair.fromWIF(
          //@ts-ignore: strictNullChecks
          this.app.services.auth.accounts[this.account].getPrivateKey(),
          this.network
        )

        tx.__INPUTS.forEach((input, index) => {
          tx.sign(index, privKey)
        })

        const txRaw = tx.buildIncomplete()

        if (typeof handleTransactionHash === 'function') {
          handleTransactionHash(txRaw.getId())
        }

        this.broadcastTx(txRaw.toHex()).then((result) => {
          resolve(result)
        }).catch ((err) => {
          reject(err)
        })
      }
      catch (err) {
        reject(err)
      }
    })
  }

  /**
   *
   * @param {object|string} data - scriptValues or wallet address
   * @returns {Promise.<void>}
   */
  async getBalance(data, hashName?: string): Promise<number> {
    let address

    if (typeof data === 'string') {
      address = data
    }
    else if (typeof data === 'object') {
      const { scriptAddress } = this.createScript(data, hashName)

      address = scriptAddress
    }
    else {
      throw new Error('Wrong data type')
    }

    const unspents      = await this.fetchUnspents(address)
    const totalUnspent  = unspents && unspents.length && unspents.reduce((summ, { satoshis }) => summ + satoshis, 0) || 0

    return totalUnspent
  }

  /**
   *
   * @param {object} data
   * @param {object} data.scriptValues
   * @param {string} data.secret
   * @param {boolean} isRefund
   * @returns {Promise}
   */
  async getWithdrawRawTransaction(data: any, isRefund: boolean, hashName?: string) {
    const { scriptValues, secret, destinationAddress } = data
    //@ts-ignore: strictNullChecks
    const destAddress = (destinationAddress) ? destinationAddress : this.app.services.auth.accounts[this.account].getAddress()

    const { script, scriptAddress } = this.createScript(scriptValues, hashName)

    const tx            = new this.app.env.bitcoin.TransactionBuilder(this.network)
    const unspents      = await this.fetchUnspents(scriptAddress)

    const feeValueBN    = await this.getTxFee({ inSatoshis: true, address: scriptAddress, swapUTXOMethod: 'withdraw' })
    const feeValue      = feeValueBN.integerValue().toNumber()
    const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

    /* Check - may be withdrawed */
    if (typeof this.checkWithdraw === 'function') {
      const hasWithdraw = await this.checkWithdraw(scriptAddress)
      if (hasWithdraw
        && hasWithdraw.address.toLowerCase() == destAddress.toLowerCase()
      ) {
        // already withdrawed
        return {
          txId: hasWithdraw.txid,
          alreadyWithdrawed: true
        }
      }
    }

    if (new BigNumber(totalUnspent).isLessThan(feeValue)) {
      throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue}`)
    }

    if (isRefund) {
      tx.setLockTime(scriptValues.lockTime)
    }

    unspents.forEach((unspent) => {
      const { txid, vout } = this.processUnspent(unspent)
      tx.addInput(txid, vout, 0xfffffffe)
    })
    tx.addOutput(destAddress, totalUnspent - feeValue)

    const txRaw = tx.buildIncomplete()

    tx.__INPUTS.map((_, index) =>
      this._signTransaction({
        script,
        secret,
        txRaw,
      }, index)
    )

    const txHex = txRaw.toHex()
    const txId = txRaw.getId()

    return {
      txHex,
      txId,
    }
    return txRaw
  }

  /**
   *
   * @param {object} data
   * @param {object} data.scriptValues
   * @param {string} data.secret
   * @param {boolean} isRefund
   * @returns {Promise}
   */
  async getWithdrawHexTransaction(data, isRefund) {
    const txRaw = await this.getWithdrawRawTransaction(data, isRefund)

    return txRaw.txHex
  }

  /**
   *
   * @param {object} data
   * @param {object} data.scriptValues
   * @param {string} data.secret
   * @returns {Promise}
   */
  getRefundRawTransaction(data) {
    return this.getWithdrawRawTransaction(data, true)
  }

  async fundSwapScript({
    flow,
  }: {
    flow: any, // Flow, @todo - add all fields
  }) {
    const utxoClass = this
    const coin = this._swapName.toLowerCase()

    const onTransactionHash = (txID) => {
      const {
        utxoScriptCreatingTransactionHash: scriptCreatingTransactionHash,
        utxoScriptValues: scriptValues,
      } = flow.state

      if (scriptCreatingTransactionHash) {
        return
      }

      flow.setState({
        utxoScriptCreatingTransactionHash: txID,
      })

      flow.swap.room.once(`request utxo script`, () => {
        flow.swap.room.sendMessage({
          event: `create utxo script`,
          data: {
            scriptValues,
            utxoScriptCreatingTransactionHash: txID,
          }
        })
      })

      flow.swap.room.sendMessage({
        event: `create utxo script`,
        data: {
          scriptValues,
          utxoScriptCreatingTransactionHash: txID,
        }
      })
    }

    const {
      swap: {
        sellAmount,
      },
      state: {
        isBalanceEnough,
        utxoScriptValues: scriptValues,
      },
    } = flow

    if (isBalanceEnough) {
      const fundScriptRepeat = async () => {
        try {
          await utxoClass.fundScript({
            scriptValues,
            amount: sellAmount,
          })
          return true
        } catch (err) {
          if (err === 'Script funded already') {
            console.warn('Script already funded')
            return true
          } else {
            if (err === 'Conflict') {
              // @ToDo - its can be not btc, other UTXO, but, with btc its frequent error
              console.warn('UTXO(BTC) locked. Has not confirmed tx in mempool. Wait confirm')
              flow.swap.room.sendMessage({
                event: 'wait utxo unlock',
                data: {},
              })
              flow.setState({
                waitUnlockUTXO: true,
              })
              await util.helpers.waitDelay(30)
              return false
            } else {
              console.log('Fail fund script', err)
            }
          }
        }
        return true
      }

      await util.helpers.repeatAsyncUntilResult(async (stopRepeat) => {
        const { isStoppedSwap } = flow.state

        if (!isStoppedSwap) {
          return await fundScriptRepeat()
        } else {
          stopRepeat()
        }
      })
    }

    const checkScriptBalance = async () => {
      const { scriptAddress } = utxoClass.createScript(scriptValues)
      const unspents = await utxoClass.fetchUnspents(scriptAddress)

      if (unspents.length === 0) {
        return false
      }

      const txID = unspents[0].txid

      const balance = await utxoClass.getBalance(scriptValues)

      const isEnoughMoney = new BigNumber(balance).isGreaterThanOrEqualTo(sellAmount.times(1e8))

      if (isEnoughMoney) {
        flow.setState({
          scriptBalance: new BigNumber(balance).div(1e8).dp(8),
        })

        onTransactionHash(txID)
      }

      return isEnoughMoney
    }

    await util.helpers.repeatAsyncUntilResult(async (stopRepeat) => {
      const { isStoppedSwap } = flow.state

      if (!isStoppedSwap) {
        return await checkScriptBalance()
      } else {
        stopRepeat()
      }
    })

    const { isStoppedSwap } = flow.state

    if (!isStoppedSwap) {
      flow.finishStep({
        [`is${coin}ScriptFunded}`]: true,
        isUTXOScriptFunded: true,
      }, { step: `lock-utxo` })
    }
  }

  /**
   *
   * @param {object} data
   * @param {object} data.scriptValues
   * @param {string} data.secret
   * @returns {Promise}
   */
  async getRefundHexTransaction(data) {
    const txRaw = await this.getRefundRawTransaction(data)

    return txRaw.txHex
  }

  /**
   *
   * @param {object} data
   * @param {object} data.scriptValues
   * @param {string} data.secret
   * @param {function} handleTransactionHash
   * @param {boolean} isRefund
   * @param {string} hashName
   * @returns {Promise}
   */
  withdraw(data, isRefund: boolean = false, hashName?: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('withdraw')
        const txRaw = await this.getWithdrawRawTransaction(data, isRefund, hashName)

        if (txRaw.alreadyWithdrawed) {
          resolve(txRaw.txId)
          return
        }

        debug('swap.core:swaps')('raw tx withdraw', txRaw.txHex)

        console.log('broadcast')
        const result = await this.broadcastTx(txRaw.txHex)

        console.log('broadcast ready', result)

        // Wait some delay until transaction can be rejected or broadcast failed
        await util.helpers.waitDelay(10)

        const txSuccess = await this.checkTX(txRaw.txId)

        if (txSuccess) {
          resolve(txRaw.txId)
        } else {
          console.warn('BtcSwap: cant withdraw', 'Generated TX not found')
          reject('TX not found. Try it later. ' + txRaw.txId)
        }
      }
      catch (error) {
        console.warn('BtcSwap: cant withdraw', error.message)

        let errorMessage

        if (error.res && /non-final/.test(error.res.text)) {
          errorMessage = 'Try it later'
        } else if (/Total less than fee/.test(error.message)) {
          if (/Total less than fee: 0/.test(error.message)) {
            errorMessage = 'Address is empty'
          } else {
            errorMessage = 'Less than fee'
          }
        } else {
          errorMessage = error
        }

        reject(errorMessage)
      }
    })
  }

  /**
   * 
   * @param {string} txID
   * @returns {Promise}
   */
  async checkTX(txID) {
    console.log('check tx')
    const txInfo = await this.fetchTxInfo(txID)
    console.log('txInfo', txInfo)
    if (txInfo
      && txInfo.senderAddress
      && txInfo.txid
      && (txInfo.txid.toLowerCase() == txID.toLowerCase())
    ) {
      return true
    }
    return false
  }
  /**
   *
   * @param {object} data
   * @param {object} data.scriptValues
   * @param {string} data.secret
   * @param {function} handleTransactionHash
   * @param {string} hashName
   * @returns {Promise}
   */
  refund(data: any, hashName?: string) {
    return this.withdraw(data, true, hashName)
  }


  async withdrawFromSwap({
    flow,
  }: {
    flow: any,
  }) {
    const utxoClass = this
    const coin = this._swapName.toLowerCase()

    await util.helpers.repeatAsyncUntilResult((stopRepeat) => {
      const {
        secret,
        utxoScriptValues: scriptValues,
        utxoSwapWithdrawTransactionHash: swapWithdrawTransactionHash,
      } = flow.state

      if (swapWithdrawTransactionHash) {
        return true
      }

      if (!scriptValues) {
        console.error(`There is no "utxoScriptValues" in state. No way to continue swap...`)
        return null
      }

      return utxoClass.withdraw({
        scriptValues,
        secret,
        destinationAddress: flow.swap.destinationBuyAddress,
      })
        .then((hash) => {
          console.log('withdraw hash', hash)
          flow.setState({
            utxoSwapWithdrawTransactionHash: hash,
          }, true)
          return true
        })
        .catch((error) => null)
    })

    flow.finishStep({
      [`is${coin}Withdrawn`]: true,
      isUTXOWithdrawn: true,
    }, { step: `withdraw-utxo` })
  }

  getSecretFromTxhash(transactionHash) {
    return new Promise((resolve) => {
      if (this.fetchTxInputScript !== undefined) {
        this.fetchTxInputScript({
          txId: transactionHash,
          hash: transactionHash
        }).then((txResult) => {
          if (txResult) {
            const scriptOpts = txResult.split(' ')
            if (scriptOpts.length>3) {
              resolve(scriptOpts[2])
              return
            }
          }
          resolve(false)
        })
      } else {
        resolve(false)
      }
    })
  }
}


export default UTXOBlockchain

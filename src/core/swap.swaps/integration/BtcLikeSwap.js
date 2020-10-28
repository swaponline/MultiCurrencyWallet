import debug from 'debug'
import SwapApp, { SwapInterface, constants, util } from 'swap.app'
import BigNumber from 'bignumber.js'



class BtcLikeSwap extends SwapInterface {

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
   * @returns {BigNumber}
   * @public
   */
  async getTxFee({ inSatoshis, size, speed = 'fast', address } = {}) {
    const estimatedFeeRaw = await this.estimateFeeValue({
      inSatoshis: true,
      address,
      speed,
      method: 'swap',
      txSize: size,
    })

    const estimatedFee = BigNumber(estimatedFeeRaw)
    this.feeValue = estimatedFee

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
      fees = BigNumber(fees).multipliedBy(1e8).toNumber()
      const currentFastestFee = await this.getTxFee({ inSatoshis: true, size, speed: 'fast', address })

      return BigNumber(fees).isLessThan(currentFastestFee)
        ? BigNumber(fees).dividedBy(currentFastestFee).toNumber()
        : 1
    }

    /* @ToDo - больше гибкости */
    const fetchConfidence = async (unspent) => {

      if (this.skipFetchConfidence) return 1

      try {
        const {
          fees,
          size,
          senderAddress,
          confirmations: txConfirms,
        } = unspent

        if (txConfirms > 0) {
          return 1
        }

        if (fees) {
          const confFromFee = await feesToConfidence(fees, size, senderAddress)
          return confFromFee
        }

        throw new Error(`txinfo={confirmations: ${confirmations}, fees: ${fees}, size: ${size}, senderAddress: ${senderAddress} }`)

      } catch (err) {
        console.error(`BtcSwap: Error fetching confidence: using confirmations > 0:`, err.message)
        return confidenceFromConfirmations
      }
    }

    const confidences = await Promise.all(unspents.map(fetchConfidence))

    return unspents.filter((utxo, index) => {
      debug('swap.core:swaps')(`confidence[${index}]:`, confidences[index])
      return BigNumber(confidences[index]).isGreaterThanOrEqualTo(expectedConfidenceLevel)
    })
  }

  /**
   *
   * @param {Array[object]} unspents
   * @return {Array[object]}
   */
  async filterConfirmedUnspents(unspents) {
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

      hashOpcode,
      Buffer.from(secretHash, 'hex'),
      this.app.env.bitcoin.opcodes.OP_EQUALVERIFY,

      Buffer.from(recipientPublicKey, 'hex'),
      this.app.env.bitcoin.opcodes.OP_EQUAL,
      this.app.env.bitcoin.opcodes.OP_IF,

      Buffer.from(recipientPublicKey, 'hex'),
      this.app.env.bitcoin.opcodes.OP_CHECKSIG,

      this.app.env.bitcoin.opcodes.OP_ELSE,

      this.app.env.bitcoin.script.number.encode(lockTime),
      this.app.env.bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
      this.app.env.bitcoin.opcodes.OP_DROP,
      Buffer.from(ownerPublicKey, 'hex'),
      this.app.env.bitcoin.opcodes.OP_CHECKSIG,

      this.app.env.bitcoin.opcodes.OP_ENDIF,
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

  fetchUnspentsFullInfo(scriptAddress) {
    console.log('fetchUnspentsFullInfo', scriptAddress)
    return new Promise(async (resolve) => {
      const unspents      = await this.fetchUnspents(scriptAddress)
      const fetchFullUnspentInfo = async (unspent) => {
        console.log('unspent', unspent)
        try {
          const info = await this.fetchTxInfo(unspent.txid)
          return {
            ...unspent,
            ...info,
          }
        } catch (fetchTxInfoError) {
          console.log('fetchTxInfo', fetchTxInfoError)
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
    console.log('script', scriptAddress)
    const unspents      = await this.fetchUnspentsFullInfo(scriptAddress)

    console.log('script', scriptAddress)
    console.log('unspents', unspents)
    if (!unspents.length) return `No unspents. Wait`

    
    // Check - transaction can be replaced?
    const canBeReplaced = this.checkCanBeReplaces(unspents)
    if (canBeReplaced) {
      console.warn(`Fund to script ${scriptAddress} can be replaced be fee. Wait confirm`)
    }
    if (waitConfirm || canBeReplaced) {
      // Wait confirm only - for big amount of swap
      if (!unspents.length) return `No unspents`
      const confirmedUnspents = await this.filterConfirmedUnspents(unspents)
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
  fundScript(data, handleTransactionHash, hashName) {
    const { scriptValues, amount } = data

    console.log('fundScript', data)
    return new Promise(async (resolve, reject) => {
      try {
        const { scriptAddress } = this.createScript(scriptValues, hashName)

        console.log('scriptAddress', scriptAddress)
        const scriptBalance = await this.fetchBalance(scriptAddress)
        if (BigNumber(scriptBalance).isGreaterThan(0)) {
          // Script already funded - skip double payments
          reject('Script funded already')
          return
        }

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
        tx.addOutput(this.app.services.auth.accounts[this.account].getAddress(), skipValue)

        const privKey = this.app.env.bitcoin.ECPair.fromWIF(
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
  async getBalance(data, hashName) {
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
  async getWithdrawRawTransaction(data, isRefund, hashName) {
    const { scriptValues, secret, destinationAddress } = data
    const destAddress = (destinationAddress) ? destinationAddress : this.app.services.auth.accounts[this.account].getAddress()

    const { script, scriptAddress } = this.createScript(scriptValues, hashName)

    const tx            = new this.app.env.bitcoin.TransactionBuilder(this.network)
    const unspents      = await this.fetchUnspents(scriptAddress)

    const feeValueBN    = await this.getTxFee({ inSatoshis: true, address: scriptAddress })
    const feeValue      = feeValueBN.integerValue().toNumber()
    const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

    /* Check - may be withdrawed */
    if (typeof this.checkWithdraw === 'function') {
      console.log('try check withdraw')
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

    if (BigNumber(totalUnspent).isLessThan(feeValue)) {
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
  withdraw(data, isRefund, hashName) {
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
          reject('TX not found. Try it later. ',txRaw.txId)
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
  refund(data, hashName) {
    return this.withdraw(data, true, hashName)
  }
}


export default BtcLikeSwap

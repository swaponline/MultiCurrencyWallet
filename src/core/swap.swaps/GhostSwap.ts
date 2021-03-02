import debug from 'debug'
import SwapApp, { SwapInterface, constants, util } from 'swap.app'
import BigNumber from 'bignumber.js'
import bitcore from 'ghost-bitcore-lib'
const PrivateKey = bitcore.PrivateKey;
const BufferUtil = bitcore.util.buffer;

class GhostSwap extends SwapInterface {

  _swapName: string
  fetchBalance: any
  fetchUnspents: any
  broadcastTx: any
  checkWithdraw: any
  feeValue: any
  fetchTxInfo: any
  estimateFeeValue: ({}) => string

  app: any
  network: any

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
      throw new Error('GhostSwap: "fetchBalance" required')
    }
    if (typeof options.fetchUnspents !== 'function') {
      throw new Error('GhostSwap: "fetchUnspents" required')
    }
    if (typeof options.broadcastTx !== 'function') {
      throw new Error('GhostSwap: "broadcastTx" required')
    }
    if (typeof options.fetchTxInfo !== 'function') {
      // tx_hash => { confidence, fees }
      console.warn(`GhostSwap: "fetchTxInfo" is not a function. You will not be able to use tx-confidence feature`)
    }
    if (typeof options.estimateFeeValue !== 'function') {
      // ({ speed } = {}) => feeRate
      console.warn(`GhostSwap: "estimateFeeValue" is not a function. You will not be able use automatic mempool-based fee`)
    }

    this._swapName = constants.COINS.ghost
    this.fetchBalance = options.fetchBalance
    this.fetchUnspents = options.fetchUnspents
    this.broadcastTx = options.broadcastTx
    this.checkWithdraw = options.checkWithdraw
    this.feeValue = options.feeValue || 546
    this.fetchTxInfo = options.fetchTxInfo || (() => { })
    this.estimateFeeValue = options.estimateFeeValue || (() => 0)
  }

  _initSwap(app) {
    super._initSwap(app)

    this.app = app

    this.network = this.app.services.auth.accounts.ghost.network // TODO: templess solution, try to find better solution
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
  async getTxFee({ inSatoshis, size, speed = 'fast', address }) {
    let estimatedFee = new BigNumber(await this.estimateFeeValue({ 
      inSatoshis,
      address,
      speed,
      method: 'swap',
      txSize: size
    }))

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
      const currentFastestFee = await this.getTxFee({ inSatoshis: true, size, speed: 'fast', address })

      return new BigNumber(fees).isLessThan(currentFastestFee)
        ? new BigNumber(fees).dividedBy(currentFastestFee).toNumber()
        : 1
    }

    const confirmationsToConfidence = confs => confs > 0 ? 1 : 0

    const fetchConfidence = async ({ txid, confirmations }) => {
      const confidenceFromConfirmations = confirmationsToConfidence(confirmations)

      if (new BigNumber(confidenceFromConfirmations).isGreaterThanOrEqualTo(expectedConfidenceLevel)) {
        return confidenceFromConfirmations
      }

      try {
        const info = await this.fetchTxInfo(txid)

        const { fees, size, senderAddress } = info

        if (fees) {
          return await feesToConfidence(fees, size, senderAddress)
        }

        throw new Error(`txinfo=${{ confirmations, fees, size, senderAddress }}`)

      } catch (err) {
        console.error(`GhostSwap: Error fetching confidence: using confirmations > 0:`, err.message)
        return confidenceFromConfirmations
      }
    }

    const confidences = await Promise.all(unspents.map(fetchConfidence))

    return unspents.filter((utxo, index) => {
      debug('swap.core:swaps')(`confidence[${index}]:`, confidences[index])
      //@ts-ignore
      return new BigNumber(confidences[index]).isGreaterThanOrEqualTo(expectedConfidenceLevel)
    })
  }
  /**
   *
   * @param {object} data
   * @param {object} data.script
   * @param {*} data.tx
   * @param {string} data.secret
   * @param {number} inputIndex
   * @private
   */
  _signTransaction(data, inputIndex = 0) {
    debug('swap.core:swaps')('signing script input', inputIndex)
    const { script, tx, secret } = data
    const hashType = this.app.env.bitcoin.Transaction.SIGHASH_ALL
    // At the moment we are using Bitcore lib from Ghost to handle signing logic. TODO: port Bitcoinjs-lib to be compatible with Ghost and
    // to avoid lib's duplicate
    const network = this.app.isMainNet() ? bitcore.Networks.mainnet : bitcore.Networks.testnet; 
    // For refund we need to change the sequence number
    tx.inputs[inputIndex].sequenceNumber = 4294967294;
    const privateKey = new PrivateKey(this.app.services.auth.accounts.ghost.getPrivateKey(), network);
    const signature = bitcore.Transaction.Sighash.sign(tx, privateKey, hashType, inputIndex, script);
    const sigBuffer = BufferUtil.concat([
      signature.toDER(),
      BufferUtil.integerAsSingleByteBuffer(hashType)
    ]);
    const payment = this.app.env.bitcoin.payments.p2sh({
      redeem: this.app.env.bitcoin.payments.p2wsh({
        redeem: {
          output: script,
          input: this.app.env.bitcoin.script.compile([
            sigBuffer,
            this.app.services.auth.accounts.ghost.getPublicKeyBuffer(),
            Buffer.from(secret.replace(/^0x/, ''), 'hex'),
          ])
        }
      })
    })
    
    tx.inputs[inputIndex].setWitnesses(payment.witness);
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

    const scriptData = this.app.env.bitcoin.payments.p2sh({ redeem: { output: script, network: this.network }, network: this.network })
    const scriptAddress = scriptData.address;

    return {
      scriptAddress,
      script,
    }
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

    const expectedConfidence = expected.confidence || 0.95
    const unspents = await this.fetchUnspents(scriptAddress)
    const expectedValue = expected.value.multipliedBy(1e8).integerValue()
    const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

    const confidentUnspents = await this.filterConfidentUnspents(unspents, expectedConfidence)
    const totalConfidentUnspent = confidentUnspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

    if (expectedValue.isGreaterThan(totalUnspent)) {
      return `Expected script value: ${expectedValue.toNumber()}, got: ${totalUnspent}, address: ${scriptAddress}`
    }
    if (expected.lockTime > lockTime) {
      return `Expected script lockTime: ${expected.lockTime}, got: ${lockTime}, address: ${scriptAddress}`
    }
    if (expected.recipientPublicKey !== recipientPublicKey) {
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

    return new Promise(async (resolve, reject) => {
      try {

        const { scriptAddress } = this.createScript(scriptValues, hashName)

        const ownerAddress = this.app.services.auth.accounts.ghost.getAddress()

        const unspents = await this.fetchUnspents(ownerAddress)
        const fundValue = amount.multipliedBy(1e8).integerValue().toNumber()
        //@ts-ignore
        const feeValueBN = await this.getTxFee({
          inSatoshis: true,
          address: ownerAddress,
        })
        const feeValue = feeValueBN.integerValue().toNumber()
        const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
        const skipValue = totalUnspent - fundValue - feeValue
        if (totalUnspent < feeValue + fundValue) {
          throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue} + ${fundValue}`)
        }

        const transaction = new bitcore.Transaction()
          .from(unspents)         
          .to(scriptAddress, fundValue) 
          .change(this.app.services.auth.accounts.ghost.getAddress())     
          .sign(this.app.services.auth.accounts.ghost.getPrivateKey())    

        if (typeof handleTransactionHash === 'function') {
          handleTransactionHash(transaction.toObject().txid)
        }

        try {
          const result = await this.broadcastTx(String(transaction.serialize()))
          resolve(result)
        }
        catch (err) {
          reject(err)
        }
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

    const unspents = await this.fetchUnspents(address)
    const totalUnspent = unspents && unspents.length && unspents.reduce((summ, { satoshis }) => summ + satoshis, 0) || 0

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
  async getWithdrawRawTransaction(data, isRefund, hashName?) {
    const { scriptValues, secret, destinationAddress } = data
    const destAddress = (destinationAddress) ? destinationAddress : this.app.services.auth.accounts.ghost.getAddress()

    const { script, scriptAddress } = this.createScript(scriptValues, hashName)
    const unspents = await this.fetchUnspents(scriptAddress)
    //@ts-ignore
    const feeValueBN = await this.getTxFee({
      inSatoshis: true,
      address: scriptAddress
    })
    const feeValue = feeValueBN.integerValue().toNumber()
    const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

    if (new BigNumber(totalUnspent).isLessThan(feeValue)) {
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
        } else {
          throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue}`)
        }
      } else {
        throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue}`)
      }
    }

    const tx = new bitcore.Transaction();

    if (isRefund) {
      tx.lockUntilDate(scriptValues.lockTime);
    }
 
    tx.from(unspents);
    tx.to(destAddress, totalUnspent - feeValue);
    // Sign input witness's
    tx.inputs.map((_, index) =>
      this._signTransaction({
        script,
        secret,
        tx,
      }, index)

    );

    const txHex = tx.toString()
    const txId = tx.toObject().hash

     return {
       txHex,
       txId,
     }

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
        const txRaw = await this.getWithdrawRawTransaction(data, isRefund, hashName)

        if (txRaw.alreadyWithdrawed) {
          resolve(txRaw.txId)
          return
        }

        debug('swap.core:swaps')('raw tx withdraw', txRaw.txHex)

        const result = await this.broadcastTx(txRaw.txHex)


        // Wait some delay until transaction can be rejected or broadcast failed
        await util.helpers.waitDelay(10)

        const txSuccess = await this.checkTX(txRaw.txId)

        if (txSuccess) {
          resolve(txRaw.txId)
        } else {
          console.warn('GhostSwap: cant withdraw', 'Generated TX not found')
          reject('TX not found. Try it later. ')
        }
      }
      catch (error) {
        console.warn('GhostSwap: cant withdraw', error.message)

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
    const txInfo = await this.fetchTxInfo(txID)
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


export default GhostSwap

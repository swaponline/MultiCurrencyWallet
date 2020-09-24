import debug from 'debug'
import SwapApp, { SwapInterface, constants, util } from 'swap.app'


class SumSwap extends SwapInterface {

  /**
   *
   * @param options
   * @param options.fetchBalance
   * @param options.fetchUnspents
   * @param options.broadcastTx
   * @param options.fetchTx
   */
  constructor(options) {
    super()

    if (typeof options.fetchBalance !== 'function') {
      throw new Error('SumSwap: "fetchBalance" required')
    }
    if (typeof options.fetchUnspents !== 'function') {
      throw new Error('SumSwap: "fetchUnspents" required')
    }
    if (typeof options.broadcastTx !== 'function') {
      throw new Error('SumSwap: "broadcastTx" required')
    }
    if (typeof options.fetchTx !== 'function') {
      throw new Error('SumSwap: "fetchTx" required')
    }

    this._swapName      = constants.COINS.sum
    this.fetchBalance   = options.fetchBalance
    this.fetchUnspents  = options.fetchUnspents
    this.broadcastTx    = options.broadcastTx
    this.fetchTx      = options.fetchTx
    this.feeValue       = options.feeValue || 100000
  }

  _initSwap(app) {
    super._initSwap(app)

    this.app = app

    this.network = this.app.services.auth.accounts.sum.network // TODO: templess solution, try to find better solution
     /*
     * this.network != this.app.services.auth.accounts.sum.network
     *
     this.network = (
      this.app.isMainNet()
        ? this.app.env.coininfo.sumcoin.main
        : this.app.env.coininfo.sumcoin.test
    ).toBitcoinJS()
     */
  }

  /**
   *
   * @param {object} data
   * @param {object} data.script
   * @param {*} data.txRaw
   * @param {string} data.secret
   * @private
   */
  _signTransaction(data) {
    const { script, txRaw, secret } = data

    const hashType      = this.app.env.bitcoin.Transaction.SIGHASH_ALL
    const signatureHash = txRaw.hashForSignature(0, script, hashType)
    const signature     = this.app.services.auth.accounts.sum.sign(signatureHash).toScriptSignature(hashType)

    const scriptSig = this.app.env.bitcoin.script.scriptHash.input.encode(
      [
        signature,
        this.app.services.auth.accounts.sum.getPublicKeyBuffer(),
        Buffer.from(secret.replace(/^0x/, ''), 'hex'),
      ],
      script,
    )

    txRaw.setInputScript(0, scriptSig)
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

    debug('swap.core:swaps')('DATA', data)

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

    const scriptPubKey  = this.app.env.bitcoin.script.scriptHash.output.encode(this.app.env.bitcoin.crypto.hash160(script))
    const scriptAddress = this.app.env.bitcoin.address.fromOutputScript(scriptPubKey, this.network)

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

    const unspents      = await this.fetchUnspents(scriptAddress)
    const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
    const expectedValue = expected.value.multipliedBy(1e8).integerValue()

    if (expectedValue.isGreaterThan(totalUnspent)) {
      return `Expected script value: ${expectedValue.toNumber()}, got: ${totalUnspent}`
    }
    if (expected.lockTime > lockTime) {
      return `Expected script lockTime: ${expected.lockTime}, got: ${lockTime}`
    }
    if (expected.recipientPublicKey !== recipientPublicKey) {
      return `Expected script recipient publicKey: ${expected.recipientPublicKey}, got: ${recipientPublicKey}`
    }
  }

  /**
   *
   * @param {object} data
   * @param {object} data.scriptValues
   * @param {BigNumber} data.amount
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  fundScript(data, handleTransactionHash, hashName) {
    const { scriptValues, amount } = data

    return new Promise(async (resolve, reject) => {
      try {
        const { scriptAddress } = this.createScript(scriptValues, hashName)

        const tx            = new this.app.env.bitcoin.TransactionBuilder(this.network)
        const unspents      = await this.fetchUnspents(this.app.services.auth.accounts.sum.getAddress())

        const fundValue     = amount.multipliedBy(1e8).integerValue().toNumber()
        const feeValue      = this.feeValue // TODO how to get this value
        const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
        const skipValue     = totalUnspent - fundValue - feeValue

        if (totalUnspent < feeValue + fundValue) {
          throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue} + ${fundValue}`)
        }

        unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout))
        tx.addOutput(scriptAddress, fundValue)
        tx.addOutput(this.app.services.auth.accounts.sum.getAddress(), skipValue)
        tx.inputs.forEach((input, index) => {
          tx.sign(index, this.app.services.auth.accounts.sum)
        })

        const txRaw = tx.buildIncomplete()

        if (typeof handleTransactionHash === 'function') {
          handleTransactionHash(txRaw.getId())
        }

        try {
          const result = await this.broadcastTx(txRaw.toHex())

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
    const { scriptValues, secret } = data

    const { script, scriptAddress } = this.createScript(scriptValues, hashName)

    const tx            = new this.app.env.bitcoin.TransactionBuilder(this.network)
    const unspents      = await this.fetchUnspents(scriptAddress)
    const feeValue      = this.feeValue // TODO how to get this value
    const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

    if (totalUnspent < feeValue) {
      throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue}`)
    }

    if (isRefund) {
      tx.setLockTime(scriptValues.lockTime)
    }

    unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe))
    tx.addOutput(this.app.services.auth.accounts.sum.getAddress(), totalUnspent - feeValue)

    const txRaw = tx.buildIncomplete()

    this._signTransaction({
      script,
      secret,
      txRaw,
    })

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

    return txRaw.toHex()
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

    return txRaw.toHex()
  }

  /**
   *
   * @param {object} data
   * @param {string} data.ownerAddress
   * @param {BigNumber} data.expectedValue
   * @returns {Promise.<string>}
   */
  async checkBalance(data) {
    const { ownerAddress, expectedValue } = data
    let balance = await util.helpers.repeatAsyncUntilResult(() =>
      this.getBalance( ownerAddress )
    )


    if (expectedValue.isGreaterThan(balance)) {
      return `Expected value: ${expectedValue.toNumber()}, got: ${balance}`
    }
  }

  /**
   *
   * @param {object} data
   * @param {object} data.scriptValues
   * @param {string} data.secret
   * @param {function} handleTransactionHash
   * @param {boolean} isRefund
   * @returns {Promise}
   */
  withdraw(data, handleTransactionHash, isRefund, hashName) {
    return new Promise(async (resolve, reject) => {
      try {
        const txRaw = await this.getWithdrawRawTransaction(data, isRefund, hashName)
        debug('swap.core:swaps')('raw tx withdraw', txRaw.toHex())

        if (typeof handleTransactionHash === 'function') {
          handleTransactionHash(txRaw.getId())
        }

        const result = await this.broadcastTx(txRaw.toHex())

        resolve(result)
      }
      catch (err) {
        reject(err)
      }
    })
  }

  /**
   *
   * @param {object} data
   * @param {object} data.scriptValues
   * @param {string} data.secret
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  refund(data, handleTransactionHash) {
    return this.withdraw(data, handleTransactionHash, true)
  }

  /**
   *
   * @param {string} transactionHash
   * @returns {Promise<any>}
   */
  getSecretFromTxhash = (transactionHash) =>
    util.helpers.repeatAsyncUntilResult(() =>
      this.fetchTx(transactionHash)
        .then(txResult => txResult.vin[0].scriptSig.asm.split(' ')[2])
    )
}

export default SumSwap

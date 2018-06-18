import SwapApp, { SwapInterface } from 'swap.app'


class BtcSwap extends SwapInterface {

  /**
   *
   * @param options
   * @param options.fetchBalance
   * @param options.fetchUnspents
   * @param options.broadcastTx
   */
  constructor(options) {
    super()

    if (typeof options.fetchBalance !== 'function') {
      throw new Error('EthSwap: "fetchBalance" required')
    }
    if (typeof options.fetchUnspents !== 'function') {
      throw new Error('EthSwap: "fetchUnspents" required')
    }
    if (typeof options.broadcastTx !== 'function') {
      throw new Error('EthSwap: "broadcastTx" required')
    }

    this._swapName      = 'btcSwap'
    this.fetchBalance   = options.fetchBalance
    this.fetchUnspents  = options.fetchUnspents
    this.broadcastTx    = options.broadcastTx
  }

  _initSwap() {
    this.network = (
      SwapApp.isMainNet()
        ? SwapApp.env.bitcoin.networks.bitcoin
        : SwapApp.env.bitcoin.networks.testnet
    )
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

    const hashType      = SwapApp.env.bitcoin.Transaction.SIGHASH_ALL
    const signatureHash = txRaw.hashForSignature(0, script, hashType)
    const signature     = SwapApp.services.auth.accounts.btc.sign(signatureHash).toScriptSignature(hashType)

    const scriptSig = SwapApp.env.bitcoin.script.scriptHash.input.encode(
      [
        signature,
        SwapApp.services.auth.accounts.btc.getPublicKeyBuffer(),
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
   * @returns {{address: *, script: (*|{ignored}), secretHash: *, ownerPublicKey: *, recipientPublicKey: *, lockTime: *}}
   */
  createScript(data) {
    const { secretHash, ownerPublicKey, recipientPublicKey, lockTime } = data

    const script = SwapApp.env.bitcoin.script.compile([
      SwapApp.env.bitcoin.opcodes.OP_RIPEMD160,
      Buffer.from(secretHash, 'hex'),
      SwapApp.env.bitcoin.opcodes.OP_EQUALVERIFY,

      Buffer.from(recipientPublicKey, 'hex'),
      SwapApp.env.bitcoin.opcodes.OP_EQUAL,
      SwapApp.env.bitcoin.opcodes.OP_IF,

      Buffer.from(recipientPublicKey, 'hex'),
      SwapApp.env.bitcoin.opcodes.OP_CHECKSIG,

      SwapApp.env.bitcoin.opcodes.OP_ELSE,

      SwapApp.env.bitcoin.script.number.encode(lockTime),
      SwapApp.env.bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
      SwapApp.env.bitcoin.opcodes.OP_DROP,
      Buffer.from(ownerPublicKey, 'hex'),
      SwapApp.env.bitcoin.opcodes.OP_CHECKSIG,

      SwapApp.env.bitcoin.opcodes.OP_ENDIF,
    ])

    const scriptPubKey  = SwapApp.env.bitcoin.script.scriptHash.output.encode(SwapApp.env.bitcoin.crypto.hash160(script))
    const scriptAddress = SwapApp.env.bitcoin.address.fromOutputScript(scriptPubKey, this.network)

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
   */
  async checkScript(data, expected) {
    const { recipientPublicKey, lockTime } = data
    const { scriptAddress, script } = this.createScript(data)

    const unspents      = await this.fetchUnspents(scriptAddress)
    const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
    const expectedValue = expected.value.multipliedBy(1e8)

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
  fundScript(data, handleTransactionHash) {
    const { scriptValues, amount } = data

    return new Promise(async (resolve, reject) => {
      try {
        const { scriptAddress } = this.createScript(scriptValues)

        const tx            = new SwapApp.env.bitcoin.TransactionBuilder(this.network)
        const unspents      = await this.fetchUnspents(SwapApp.services.auth.accounts.btc.getAddress())

        const fundValue     = amount.multipliedBy(1e8).toNumber() // TODO check for number length (if need slice it)
        const feeValue      = 15000 // TODO how to get this value
        const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
        const skipValue     = totalUnspent - fundValue - feeValue

        unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout))
        tx.addOutput(scriptAddress, fundValue)
        tx.addOutput(SwapApp.services.auth.accounts.btc.getAddress(), skipValue)
        tx.inputs.forEach((input, index) => {
          tx.sign(index, SwapApp.services.auth.accounts.btc)
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
   * @param {object} data
   * @param {object} data.scriptValues
   * @param {string} data.secret
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  withdraw(data, handleTransactionHash) {
    const { scriptValues, secret } = data

    return new Promise(async (resolve, reject) => {
      try {
        const { script, scriptAddress } = this.createScript(scriptValues)

        const tx            = new SwapApp.env.bitcoin.TransactionBuilder(this.network)
        const unspents      = await this.fetchUnspents(scriptAddress)

        const feeValue      = 15000 // TODO how to get this value
        const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

        unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe))
        tx.addOutput(SwapApp.services.auth.accounts.btc.getAddress(), totalUnspent - feeValue)

        const txRaw = tx.buildIncomplete()

        this._signTransaction({
          script,
          secret,
          txRaw,
        })

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
   * @param {object} data
   * @param {object} data.scriptValues
   * @param {string} data.secret
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  refund(data, handleTransactionHash) {
    const { scriptValues, secret } = data

    return new Promise(async (resolve, reject) => {
      try {
        const { script, scriptAddress } = this.createScript(scriptValues)

        const tx            = new SwapApp.env.bitcoin.TransactionBuilder(this.network)
        const unspents      = await this.fetchUnspents(scriptAddress)

        const feeValue      = 15000 // TODO how to get this value
        const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

        tx.setLockTime(scriptValues.lockTime)
        unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe))
        tx.addOutput(SwapApp.services.auth.accounts.btc.getAddress(), totalUnspent - feeValue)

        const txRaw = tx.buildIncomplete()

        this._signTransaction({
          script,
          secret,
          txRaw,
        })

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
}


export default BtcSwap

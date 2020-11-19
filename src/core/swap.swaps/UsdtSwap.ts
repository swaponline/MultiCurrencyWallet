import debug from 'debug'
import SwapApp, { SwapInterface, constants } from 'swap.app'

const FEE_VALUE = 2000 // satoshis TODO how to get this value
const DUST = 546

import createOmniScript from './usdt/omni_script'
import createScript from './usdt/swap_script'
import createFundingTransaction from './usdt/funding_tx'

class UsdtSwap extends SwapInterface {

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
      throw new Error('UsdtSwap: "fetchBalance" required')
    }
    if (typeof options.fetchUnspents !== 'function') {
      throw new Error('UsdtSwap: "fetchUnspents" required')
    }
    if (typeof options.broadcastTx !== 'function') {
      throw new Error('UsdtSwap: "broadcastTx" required')
    }

    this._swapName      = constants.COINS.usdt
    this.fetchBalance   = options.fetchBalance
    this.fetchUnspents  = options.fetchUnspents
    this.broadcastTx    = options.broadcastTx
    this.fetchTx        = options.fetchTx

    this.getRecommendedFees = options.getRecommendedFees || (() => {})
  }

  _initSwap(app) {
    super._initSwap(app)

    this.app = app

    this.network = (
      this.app.isMainNet()
        ? this.app.env.bitcoin.networks.bitcoin
        : this.app.env.bitcoin.networks.testnet
    )

    if (!this.app.isMainNet()) {
      throw new Error(`Sorry, USDT does not yet works on testnet!`)
    }
  }

  /**
   *
   * @param {object} data
   * @param {object} data.script
   * @param {*} data.txRaw
   * @param {string} data.secret
   * @private
   */
  _signTransaction(data, inputIndex = 0) {
    const { script, txRaw, secret } = data

    const hashType      = this.app.env.bitcoin.Transaction.SIGHASH_ALL
    const signatureHash = txRaw.hashForSignature(inputIndex, script, hashType)
    const signature     = this.app.services.auth.accounts.btc.sign(signatureHash).toScriptSignature(hashType)

    const scriptSig = this.app.env.bitcoin.script.scriptHash.input.encode(
      [
        signature,
        this.app.services.auth.accounts.btc.getPublicKeyBuffer(),
        Buffer.from(secret.replace(/^0x/, ''), 'hex'),
      ],
      script,
    )

    txRaw.setInputScript(inputIndex, scriptSig)
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
  createScript(data) {
    const { secretHash, ownerPublicKey, recipientPublicKey, lockTime } = data

    debug('swap.core:swaps')('DATA', data)

    const script = this.app.env.bitcoin.script.compile([

      this.app.env.bitcoin.opcodes.OP_RIPEMD160,
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
  async checkScript(data, expected) {
    const { scriptValues, fundingTxHash } = data

    const { secretHash, ownerPublicKey, recipientPublicKey, lockTime } = scriptValues
    const { scriptAddress, script } = createScript(secretHash, ownerPublicKey, recipientPublicKey, lockTime)

    const unspents = await this.fetchUnspents(scriptAddress)
    const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
    const expectedValue = 546

    if (expectedValue > totalUnspent) {
      return `Expected script value: ${expectedValue}, got: ${totalUnspent}. Maybe the script was not mined?`
    }

    let outputs
    try {
      const tx = await this.fetchTx(fundingTxHash)

      outputs = tx.vout
    } catch (err) {
      console.error(err)
      return `Can't get funding tx outputs ${fundingTxHash}`
    }
    debug('swap.core:swaps')(outputs)

    if (!outputs || outputs.length < 2) {
      return `Expected at least 2 outputs at funding tx ${fundingTxHash}, got: ${outputs}`
    }

    // check output-0 is script with same address
    const htlcScriptOutput = outputs[0]
    try {
      const fundedScriptAddress = htlcScriptOutput.scriptPubKey.addresses[0]

      if (scriptAddress !== fundedScriptAddress) {
        return `Expected script address: ${scriptAddress}, got: ${fundedScriptAddress}`
      }
    } catch (err) {
      console.error(err)
      return `Expected script address: ${scriptAddress}, got error at ${htlcScriptOutput}`
    }

    // check output-1 is a OMNI
    const omniOutput = outputs[1]
    try {
      const omniScript = omniOutput.scriptPubKey.asm
      const expectedOmniScript = createOmniScript(expected.amount)
      const expectedOmniOutput = this.app.env.bitcoin.script.toASM(expectedOmniScript)

      if (expectedOmniOutput !== omniScript) {
        debug('swap.core:swaps')(expectedOmniOutput, omniScript)
        return `Expected first output value: `
        + expectedOmniOutput
        + `, got: `
        + omniScript
      }
    } catch (err) {
      console.error(err)
      return `Expected omni output for amount = ${expected.amount}, got error at ${omniOutput}`
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
        const { ownerPublicKey, recipientPublicKey } = scriptValues

        const dialog = {
          owner: this.app.services.auth.accounts.btc,
          party: Buffer.from(recipientPublicKey, 'hex')
        }

        const funding = await createFundingTransaction(amount, dialog, scriptValues, this.fetchUnspents, this.network)

        if (typeof handleTransactionHash === 'function') {
          const txRaw = funding.tx.buildIncomplete()
          handleTransactionHash(txRaw.getId(), funding)
        }

        try {
          const result = await this.broadcastTx(funding.hex)

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

  redeemScript(data, handleTransactionHash, isRefund) {
    const { amount, scriptValues, secret } = data

    if (!amount) {
      throw new Error(`USDT Redeem Error: amount not given: ${amount}`)
    }

    return new Promise(async (resolve, reject) => {
      try {
        const { secretHash, lockTime } = scriptValues
        const { ownerPublicKey, recipientPublicKey } = scriptValues


        const redeem_tx = new this.app.env.bitcoin.TransactionBuilder(this.network)

        const { script, scriptAddress } = createScript(
          secretHash,
          ownerPublicKey,
          recipientPublicKey,
          lockTime)

        debug('swap.core:swaps')('script address', scriptAddress)
        const keyPair = this.app.services.auth.accounts.btc
        const myBtcAddress = keyPair.getAddress()

        const myUnspents      = await this.fetchUnspents(myBtcAddress)
        const scriptUnspents  = await this.fetchUnspents(scriptAddress)


        const unspents  = [ ...scriptUnspents, ...myUnspents ]
        debug('swap.core:swaps')('unspents', unspents)
        const fundValue = DUST
        const feeValue  = 5000

        const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
        const totalValue    = totalUnspent - feeValue - fundValue

        if (totalUnspent < feeValue + fundValue) {
          throw new Error(`Total less than fee: ${totalUnspent} < ${fundValue} + ${feeValue}`)
        }

        if (isRefund) {
          redeem_tx.setLockTime(lockTime)
        }

        scriptUnspents.forEach(({ txid, vout }) => {
          redeem_tx.addInput(txid, vout, 0xfffffffe)
        })

        myUnspents.forEach(({ txid, vout }, index) => {
          redeem_tx.addInput(txid, vout)
        })

        const omniOutput = createOmniScript(amount)

        redeem_tx.addOutput(myBtcAddress, fundValue)
        redeem_tx.addOutput(myBtcAddress, totalValue)
        redeem_tx.addOutput(omniOutput, 0)

        myUnspents.forEach((utxo, index) => {
          const inputIndex = index + scriptUnspents.length
          redeem_tx.sign(inputIndex, keyPair)
        })

        const txRaw = redeem_tx.buildIncomplete()

        const forSigning = {
          txRaw,
          script,
          secret,
        }

        this._signTransaction(forSigning, 0)

        const tx = txRaw

        debug('swap.core:swaps')('redeem tx hash', tx.getId())
        debug('swap.core:swaps')(`redeem tx hex ${tx.toHex()}`)

        if (typeof handleTransactionHash === 'function') {
          handleTransactionHash(tx.getId())
        }

        try {
          const result = await this.broadcastTx(tx.toHex())

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
  async getBalance(data) {
    let address

    if (typeof data === 'string') {
      address = data
    }
    else if (typeof data === 'object') {
      const { scriptAddress } = this.createScript(data)

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
   * @param {function} handleTransactionHash
   * @param {boolean} isRefund
   * @returns {Promise}
   */
  withdraw(data, handleTransactionHash) {
    return this.redeemScript(data, handleTransactionHash, false)
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
    return this.redeemScript(data, handleTransactionHash, true)
  }
}


export default UsdtSwap

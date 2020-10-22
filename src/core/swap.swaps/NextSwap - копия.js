import debug from 'debug'
import SwapApp, { SwapInterface, constants, util } from 'swap.app'
import BigNumber from 'bignumber.js'
// todo: create next-bitcore-lib ???
//const bitcore = require('next-bitcore-lib');
const bitcore = require('bitcore-lib');
const PrivateKey = bitcore.PrivateKey;
const BufferUtil = bitcore.util.buffer;


window.bitcore = bitcore

class NextSwap extends SwapInterface {

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
      throw new Error('NextSwap: "fetchBalance" required')
    }
    if (typeof options.fetchUnspents !== 'function') {
      throw new Error('NextSwap: "fetchUnspents" required')
    }
    if (typeof options.broadcastTx !== 'function') {
      throw new Error('NextSwap: "broadcastTx" required')
    }
    if (typeof options.fetchTxInfo !== 'function') {
      // tx_hash => { confidence, fees }
      console.warn(`NextSwap: "fetchTxInfo" is not a function. You will not be able to use tx-confidence feature`)
    }
    if (typeof options.estimateFeeValue !== 'function') {
      // ({ speed } = {}) => feeRate
      console.warn(`NextSwap: "estimateFeeValue" is not a function. You will not be able use automatic mempool-based fee`)
    }

    this._swapName = constants.COINS.next
    this.fetchBalance = options.fetchBalance
    this.fetchUnspents = options.fetchUnspents
    this.broadcastTx = options.broadcastTx
    this.checkWithdraw = options.checkWithdraw
    this.feeValue = options.feeValue || 546
    this.fetchTxInfo = options.fetchTxInfo || (() => { })
    this.estimateFeeValue = options.estimateFeeValue || (() => 0)
  }

  _initNetwork() {
    bitcore.Networks.add({
      name: 'next-mainnet',
      pubkeyhash: this.app.services.auth.accounts.next.network.pubKeyHash,
      privatekey: this.app.services.auth.accounts.next.network.wif,
      scripthash: this.app.services.auth.accounts.next.network.scriptHash,
      xpubkey: this.app.services.auth.accounts.next.network.bip32.public,
      xprivkey: this.app.services.auth.accounts.next.network.bip32.private,
      networkMagic: 0xcbe4d0a1,
      port: 7077,
    })
    const bitcoreNetwork = bitcore.Networks.get('next-mainnet')
    const privateKey = new bitcore.PrivateKey.fromWIF(this.app.services.auth.accounts.next.getPrivateKey(), bitcoreNetwork)
    const publicKey = bitcore.PublicKey(privateKey, bitcoreNetwork)
    const addressFrom = new bitcore.Address(publicKey, bitcoreNetwork)
    return {
      network: bitcoreNetwork,
      privateKey,
      publicKey,
      addressFrom,
    }
  }

  _initSwap(app) {
    super._initSwap(app)

    this.app = app

    this.network = this.app.services.auth.accounts.next.network // TODO: templess solution, try to find better solution
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
    let estimatedFee = BigNumber(await this.estimateFeeValue({ inSatoshis, address, speed, method: 'swap' /*, txSize: size */ }))

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

      return BigNumber(fees).isLessThan(currentFastestFee)
        ? BigNumber(fees).dividedBy(currentFastestFee).toNumber()
        : 1
    }

    const confirmationsToConfidence = confs => confs > 0 ? 1 : 0

    const fetchConfidence = async ({ txid, confirmations }) => {
      return 1;
      const confidenceFromConfirmations = confirmationsToConfidence(confirmations)

      if (BigNumber(confidenceFromConfirmations).isGreaterThanOrEqualTo(expectedConfidenceLevel)) {
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
        console.error(`NextSwap: Error fetching confidence: using confirmations > 0:`, err.message)
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
   * @param {object} data
   * @param {object} data.script
   * @param {*} data.tx
   * @param {string} data.secret
   * @param {number} inputIndex
   * @private
   */
  _signTransaction(data, inputIndex = 0) {
    debug('swap.core:swaps')('signing script input', inputIndex, data)
    const { script, tx, secret } = data
    console.log('signTransaction', script, tx, secret)
    const hashType = this.app.env.bitcoin.Transaction.SIGHASH_ALL
    // At the moment we are using Bitcore lib from Next to handle signing logic. TODO: port Bitcoinjs-lib to be compatible with Next and
    // to avoid lib's duplicate
    const networkData = this._initNetwork()
    const network = networkData.network
    //tx.inputs[inputIndex].sequenceNumber = 4294967294;
    const privateKey = networkData.privateKey
    const signature = bitcore.Transaction.Sighash.sign(
      tx,
      privateKey,
      hashType,
      inputIndex,
      script.toScriptHashOut()
    );
    console.log('signature', signature)

    const sigBuffer = BufferUtil.concat([
      signature.toDER(),
      BufferUtil.integerAsSingleByteBuffer(hashType)
    ])

    const sigScript = new bitcore.Script()
      .add(sigBuffer)
      .add(networkData.publicKey.toBuffer())
      .add(Buffer.from(secret.replace(/^0x/, ''), 'hex'))

    console.log('sigScript', sigScript)
    console.log(sigScript.toASM())

    const payment = this.app.env.bitcoin.payments.p2sh({
      redeem: this.app.env.bitcoin.payments.p2wsh({
        redeem: {
          output: script.toBuffer(),
          input: sigScript.toBuffer()
        },
        network,
      },
      network)
    })

    window.payment = payment
    console.log('payment.witness', payment.witness)

    tx.inputs[inputIndex].setWitnesses(payment.witness);
    //tx.inputs[inputIndex].setScript(payment.witness)
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
    console.log('createScript', data)
    const hashOpcodeName = `OP_${hashName.toUpperCase()}`
    const hashOpcode = bitcore.Opcode[hashOpcodeName]

    const {
      secretHash,
      ownerPublicKey,
      recipientPublicKey,
      lockTime,
    } = data

    const scriptOpCodes = [
      hashOpcode,
      Buffer.from(secretHash, 'hex'),
      bitcore.Opcode.OP_EQUALVERIFY,

      Buffer.from(recipientPublicKey, 'hex'),
      bitcore.Opcode.OP_EQUAL,
      bitcore.Opcode.OP_IF,

      Buffer.from(recipientPublicKey, 'hex'),
      bitcore.Opcode.OP_CHECKSIG,

      bitcore.Opcode.OP_ELSE,

      bitcore.encoding.Varint(lockTime).toBuffer(),
      
      bitcore.Opcode.OP_CHECKLOCKTIMEVERIFY,
      bitcore.Opcode.OP_DROP,
      Buffer.from(ownerPublicKey, 'hex'),
      bitcore.Opcode.OP_CHECKSIG,

      bitcore.Opcode.OP_ENDIF,
    ]

    console.log('scriptOpCodes', scriptOpCodes)
    const networkData = this._initNetwork()
    const scriptData = new bitcore.Script()
    scriptOpCodes.forEach((opCode) => scriptData.add(opCode))
    
    console.log('scriptData', scriptData)
    console.log('ASM', scriptData.toASM())
    const p2shScript = scriptData.toScriptHashOut()
    console.log('p2shScript', p2shScript)
    const scriptAddressData = p2shScript.toAddress(networkData.network)
    console.log('scriptAddressData', scriptAddressData)
    const scriptAddress = scriptAddressData.toString()
    console.log('scriptAddress', scriptAddress)

    return {
      scriptAddress,
      scriptData,
      
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
        const networkData = this._initNetwork()

        const { scriptAddress } = this.createScript(scriptValues, hashName)

        const ownerAddress = this.app.services.auth.accounts.next.getAddress()

        const unspents = await this.fetchUnspents(ownerAddress)
        const fundValue = amount.multipliedBy(1e8).integerValue().toNumber()
        const feeValueBN = await this.getTxFee({ inSatoshis: true, address: ownerAddress })
        const feeValue = feeValueBN.integerValue().toNumber()
        const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
        const skipValue = totalUnspent - fundValue - feeValue
        if (totalUnspent < feeValue + fundValue) {
          throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue} + ${fundValue}`)
        }

        const transaction = new bitcore.Transaction()
          .from(unspents)         
          .to(scriptAddress, fundValue) 
          .change(networkData.addressFrom)     
          .sign(networkData.privateKey)    

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
  async getWithdrawRawTransaction(data, isRefund, hashName) {
    const { scriptValues, secret, destinationAddress } = data
    const destAddress = (destinationAddress) ? destinationAddress : this.app.services.auth.accounts.next.getAddress()

    const {
      script,
      scriptAddress,
      scriptData,
    } = this.createScript(scriptValues, hashName)
    console.log('scriptAddress', scriptAddress)
    const unspents = await this.fetchUnspents(scriptAddress)

    const feeValueBN = await this.getTxFee({ inSatoshis: true, address: scriptAddress })
    const feeValue = feeValueBN.integerValue().toNumber()
    const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

    if (BigNumber(totalUnspent).isLessThan(feeValue)) {
      /* Check - may be withdrawed */
      if (typeof this.checkWithdraw2 === 'function') {
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

    const networkData = this._initNetwork()
    const tx = new bitcore.Transaction();

    if (isRefund) {
      tx.lockUntilDate(scriptValues.lockTime);
    }
  
    //tx.from(unspents);
    tx.to(destAddress, totalUnspent - feeValue);
    // Sign input witness's
    console.log('inputs',tx.inputs)
    /*
    tx.inputs.map((_, index) =>
      this._signTransaction({
        script: scriptData,
        secret,
        tx,
      }, index)

    );
    */
    unspents.map((unspent, index) => {
      // set script for input's output
      const output = new bitcore.Transaction.Output({
        script: unspent.script,
        satoshis: unspent.satoshis
      })
      console.log('output from unspent', output)
      const input = new bitcore.Transaction.Input({
        prevTxId: unspent.txid,
        output,
        outputIndex: unspent.outputIndex,
        script: bitcore.Script.empty()
      })

      console.log('input', input)
      // add input to tx
      tx.addInput(input)
      // sign input
      // make signature
      const signature = bitcore.Transaction.Sighash.sign(
        tx,
        networkData.privateKey,
        bitcore.crypto.Signature.SIGHASH_ALL,
        index,
        scriptData
      )

      // make sig script
      const sigBuffer = BufferUtil.concat([
        signature.toDER(),
        BufferUtil.integerAsSingleByteBuffer(bitcore.crypto.Signature.SIGHASH_ALL)
      ])
      const sigScript = new bitcore.Script()
        .add(sigBuffer)
        .add(networkData.publicKey.toBuffer())
        .add(Buffer.from(secret.replace(/^0x/, ''), 'hex'))
        .add(scriptData.toBuffer())
      var witness = [
        //Buffer.alloc(0),
        sigBuffer,
        networkData.publicKey.toBuffer(),
        Buffer.from(secret.replace(/^0x/, ''), 'hex'),
        scriptData.toBuffer()
      ]
      tx.inputs[index].setScript(sigScript)
      tx.inputs[index].setWitnesses(witness)
      tx.inputs[index].redeemScript = scriptData.toHex()
      /*
      console.log(tx.inputs[index].output._script)
      //tx.inputs[index].output.setScript(scriptData)
      // make signature
      const signature = bitcore.Transaction.Sighash.sign(
        tx,
        networkData.privateKey,
        bitcore.crypto.Signature.SIGHASH_ALL,
        index,
        scriptData
      )

      
      // make sig script
      const sigBuffer = BufferUtil.concat([
        signature.toDER(),
        BufferUtil.integerAsSingleByteBuffer(bitcore.crypto.Signature.SIGHASH_ALL)
      ])

      // make witness
      var witness = [
        //Buffer.alloc(0),
        sigBuffer,
        networkData.publicKey.toBuffer(),
        Buffer.from(secret.replace(/^0x/, ''), 'hex'),
        scriptData.toBuffer()
      ]

      const sigScript = new bitcore.Script()
        .add(sigBuffer)
        .add(networkData.publicKey.toBuffer())
        .add(Buffer.from(secret.replace(/^0x/, ''), 'hex'))
        .add(scriptData.toBuffer())
      
      console.log('witness', witness)

      //sigScript._network = networkData.network
      // .redeemScript
      //
      //console.log('sigScript', sigScript.toHex())
      //tx.inputs[index].setScript(scriptData)
      //tx.inputs[index].setScript(scriptData.toScriptHashOut())
      tx.inputs[index].sequenceNumber = 4294967294
      tx.inputs[index].setWitnesses(witness)
      tx.inputs[index].redeemScript = scriptData
      console.log('signature for', index, signature)
      console.log('input', tx.inputs[index])
      */
    })
console.log(tx.toJSON())
const txHex = tx.toString()
    const txId = tx.toObject().hash
    console.log('txHex', txHex, 'txId', txId)
    return {
      txHex,
      txId,
    }
    return false
    console.log('try sign')
    tx.sign(networkData.privateKey)
    console.log(tx.toJSON())
    //const txHex = tx.toString()
    //const txId = tx.toObject().hash
    return {
      txHex,
      txId,
    }
    console.log('txHex', txHex, 'txId', txId)
    
    
/*
    const txHex = tx.toString()
    const txId = tx.toObject().hash

     return {
       txHex,
       txId,
     }
*/
    return false
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
          console.warn('NextSwap: cant withdraw', 'Generated TX not found')
          reject('TX not found. Try it later. ', txRaw.txId)
        }
      }
      catch (error) {
        console.warn('NextSwap: cant withdraw', error.message)

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


export default NextSwap

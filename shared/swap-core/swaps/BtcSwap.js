import { env } from '../util'


const utcNow = () => Math.floor(Date.now() / 1000)
const getLockTime = () => utcNow() + 3600 * 3 // 3 days from now


class BtcSwap {

  constructor({ account, fetchUnspents, broadcastTx }) {
    this.account        = account
    this.address        = account.getAddress()
    this.fetchUnspents  = fetchUnspents
    this.broadcastTx    = broadcastTx
  }

  createScript({ secretHash, btcOwnerPublicKey, ethOwnerPublicKey, lockTime: _lockTime }) {
    const lockTime = _lockTime || getLockTime()

    console.log('\n\nCreate BTC Swap Script', { secretHash, btcOwnerPublicKey, ethOwnerPublicKey, lockTime })

    // const script = env.bitcoinJs.script.compile([
    //   env.bitcoinJs.opcodes.OP_RIPEMD160,
    //   Buffer.from(secretHash, 'hex'),
    //   env.bitcoinJs.opcodes.OP_EQUALVERIFY,
    //   Buffer.from(ethOwnerPublicKey, 'hex'),
    //   env.bitcoinJs.opcodes.OP_CHECKSIG,
    // ])

    const script = env.bitcoinJs.script.compile([
      env.bitcoinJs.opcodes.OP_RIPEMD160,
      Buffer.from(secretHash, 'hex'),
      env.bitcoinJs.opcodes.OP_EQUALVERIFY,

      Buffer.from(ethOwnerPublicKey, 'hex'),
      env.bitcoinJs.opcodes.OP_EQUAL,
      env.bitcoinJs.opcodes.OP_IF,

      Buffer.from(ethOwnerPublicKey, 'hex'),
      env.bitcoinJs.opcodes.OP_CHECKSIG,

      env.bitcoinJs.opcodes.OP_ELSE,

      env.bitcoinJs.script.number.encode(lockTime),
      env.bitcoinJs.opcodes.OP_CHECKLOCKTIMEVERIFY,
      env.bitcoinJs.opcodes.OP_DROP,
      Buffer.from(btcOwnerPublicKey, 'hex'),
      env.bitcoinJs.opcodes.OP_CHECKSIG,

      env.bitcoinJs.opcodes.OP_ENDIF,
    ])

    const scriptPubKey  = env.bitcoinJs.script.scriptHash.output.encode(env.bitcoinJs.crypto.hash160(script))
    const scriptAddress = env.bitcoinJs.address.fromOutputScript(scriptPubKey, env.bitcoinJs.networks.testnet)

    return {
      address: scriptAddress,
      script,
      secretHash,
      btcOwnerPublicKey,
      ethOwnerPublicKey,
      lockTime,
    }
  }

  fundScript({ script, amount }) {
    return new Promise(async (resolve, reject) => {
      // const script        = hexStringToByte(scriptHash)
      try {
        const scriptPubKey  = env.bitcoinJs.script.scriptHash.output.encode(env.bitcoinJs.crypto.hash160(script))
        const scriptAddress = env.bitcoinJs.address.fromOutputScript(scriptPubKey, env.bitcoinJs.networks.testnet)

        const tx            = new env.bitcoinJs.TransactionBuilder(env.bitcoinJs.networks.testnet)
        const unspents      = await this.fetchUnspents(this.address)

        const fundValue     = Math.floor(Number(amount) * 1e8)
        const feeValue      = 15000 // TODO how to get this value
        const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
        const skipValue     = totalUnspent - fundValue - feeValue

        console.log('\n-----------------------------------\n\n')
        console.log('fundValue', fundValue)
        console.log('feeValue', feeValue)
        console.log('totalUnspent', totalUnspent)
        console.log('skipValue', skipValue)
        console.log('\n-----------------------------------\n\n')

        unspents.forEach(({ txid, vout }) => {
          tx.addInput(txid, vout)
        })
        tx.addOutput(scriptAddress, fundValue)
        tx.addOutput(this.address, skipValue)
        tx.inputs.forEach((input, index) => {
          tx.sign(index, this.account)
        })

        const txRaw     = tx.buildIncomplete()
        const txRawHex  = txRaw.toHex()

        console.log('\nFund BTC Swap Script', {
          script,
          scriptAddress,
          totalUnspent,
          amount,
          fundValue,
          feeValue,
          skipValue,
          tx,
          txRawHex,
        })

        let result

        try {
          result = await this.broadcastTx(txRawHex)
        }
        catch (err) {
          reject(err)
        }

        resolve(result)
      }
      catch (err) {
        reject(err)
      }
    })
  }

  withdraw({ script, secret }) {
    console.log('\n\nWithdraw money from BTC Swap Script', { script, secret })

    return new Promise(async (resolve, reject) => {
      try {
        const scriptPubKey  = env.bitcoinJs.script.scriptHash.output.encode(env.bitcoinJs.crypto.hash160(script))
        const scriptAddress = env.bitcoinJs.address.fromOutputScript(scriptPubKey, env.bitcoinJs.networks.testnet)

        const hashType      = env.bitcoinJs.Transaction.SIGHASH_ALL
        const tx            = new env.bitcoinJs.TransactionBuilder(env.bitcoinJs.networks.testnet)

        const unspents      = await this.fetchUnspents(scriptAddress)

        const feeValue      = 15000 // TODO how to get this value
        const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

        unspents.forEach(({ txid, vout }) => {
          console.log('Add input from unspents:', txid, vout)
          tx.addInput(txid, vout, 0xfffffffe)
        })
        tx.addOutput(this.address, totalUnspent - feeValue)

        console.log('Data:', {
          self: this,
          scriptAddress,
          totalUnspent,
          feeValue,
        })

        const txRaw               = tx.buildIncomplete()
        const signatureHash       = txRaw.hashForSignature(0, script, hashType)
        const signature           = this.account.sign(signatureHash).toScriptSignature(hashType)

        const scriptSig = env.bitcoinJs.script.scriptHash.input.encode(
          [
            signature,
            this.account.getPublicKeyBuffer(),
            Buffer.from(secret.replace(/^0x/, ''), 'hex'),
          ],
          script,
        )

        txRaw.setInputScript(0, scriptSig)

        const txId      = txRaw.getId()
        const txRawHex  = txRaw.toHex()

        console.log('txId', txId)
        console.log('txRawHex', txRawHex)

        const result = await this.broadcastTx(txRawHex)

        resolve(result)
      }
      catch (err) {
        reject(err)
      }
    })
  }

  refund({ script, lockTime, secret }, handleTransactionHash) {
    console.log('\n\nRefund money from BTC Swap Script')

    return new Promise(async (resolve, reject) => {
      try {
        const scriptPubKey  = env.bitcoinJs.script.scriptHash.output.encode(env.bitcoinJs.crypto.hash160(script))
        const scriptAddress = env.bitcoinJs.address.fromOutputScript(scriptPubKey, env.bitcoinJs.networks.testnet)

        const hashType      = env.bitcoinJs.Transaction.SIGHASH_ALL
        const tx            = new env.bitcoinJs.TransactionBuilder(env.bitcoinJs.networks.testnet)

        const unspents      = await this.fetchUnspents(scriptAddress)

        const feeValue      = 4e5
        const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

        tx.setLockTime(lockTime)
        unspents.forEach(({ txid, vout }) => {
          tx.addInput(txid, vout, 0xfffffffe)
        })
        tx.addOutput(this.address, totalUnspent - feeValue)

        const txRaw               = tx.buildIncomplete()
        const signatureHash       = txRaw.hashForSignature(0, script, hashType)
        const signature           = this.account.sign(signatureHash).toScriptSignature(hashType)

        const scriptSig = env.bitcoinJs.script.scriptHash.input.encode(
          [
            signature,
            this.account.getPublicKeyBuffer(),
            Buffer.from(secret, 'hex'),
          ],
          script,
        )

        txRaw.setInputScript(0, scriptSig)

        const txId      = txRaw.getId()
        const txRawHex  = txRaw.toHex()

        console.log('txId', txId)
        console.log('txRawHex', txRawHex)

        const result = await this.broadcastTx(txRawHex)

        handleTransactionHash && handleTransactionHash(txId)
        resolve(result)
      }
      catch (err) {
        reject(err)
      }
    })
  }
}


export default BtcSwap

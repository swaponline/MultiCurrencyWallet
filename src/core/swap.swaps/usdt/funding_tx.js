const bitcoin = require('bitcoinjs-lib')
const net = bitcoin.networks.bitcoin


const createScript = require('./swap_script')
const createOmniScript = require('./omni_script')
const BITCOIN_DUST = 546

const createLockTransaction = async (lockAmount, dialog, scriptValues, getUnspents, network) => {
  const { secretHash, lockTime } = scriptValues

  const { owner: ownerKey, party: recipientPublicKey } = dialog

  const ownerPublicKey = ownerKey.getPublicKeyBuffer()

  const funding_tx = new bitcoin.TransactionBuilder(network)

  const unspents = await getUnspents(ownerKey.getAddress())

  const fundValue     = BITCOIN_DUST // dust
  const feeValue      = 5000
  const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue     = totalUnspent - fundValue - feeValue

  if (totalUnspent < feeValue + fundValue) {
    throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue} + ${fundValue}`)
  }

  unspents.forEach(({ txid, vout }) => funding_tx.addInput(txid, vout, 0xfffffffe))

  const SwapScript = createScript(
    secretHash,
    ownerPublicKey.toString('hex'),
    recipientPublicKey.toString('hex'),
    lockTime
  )

  const omniOutput = createOmniScript(lockAmount)

  funding_tx.addOutput(SwapScript.scriptAddress, fundValue)
  funding_tx.addOutput(omniOutput, 0)
  funding_tx.addOutput(ownerKey.getAddress(), skipValue)

  unspents.forEach((utxo, index) => {
    funding_tx.sign(index, ownerKey)
  })

  return {
    tx: funding_tx,
    scriptValues: {
      secretHash,
      lockTime,
      scriptAddress: SwapScript.scriptAddress,
      scriptPubKey: SwapScript.scriptPubKey,
    },
    hex: funding_tx.buildIncomplete().toHex(),
  }
}

module.exports = createLockTransaction

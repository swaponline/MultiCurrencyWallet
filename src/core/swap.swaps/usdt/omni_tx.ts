import bitcoin from 'bitcoinjs-lib'
import createOmniScript from './omni_script'

// THIS IS NOT USED, that is just reference implementation
// You can use that for wallet functions USDT withdrawal
const createSimpleSend = async (alice_pair, recipient_address, amount, getUnspents, network) => {

  const tx = new bitcoin.TransactionBuilder(network)

  const alice_p2pkh = alice_pair.getAddress()
  const unspents = await getUnspents(alice_p2pkh)
  const UTXO = unspents // { txid, vout, satoshis }

  const fundValue     = 546 // dust
  const feeValue      = 5000
  const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue     = totalUnspent - fundValue - feeValue

  if (totalUnspent < feeValue + fundValue) {
    throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue} + ${fundValue}`)
  }

  unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout))

  const omniOutput = createOmniScript(amount)

  tx.addOutput(recipient_address, fundValue)
  tx.addOutput(omniOutput, 0)

  tx.addOutput(alice_p2pkh, skipValue)
  //@ts-ignore
  tx.inputs.forEach((input, index) => {
    tx.sign(index, alice_pair)
  })

  return tx
}

export default {
  createSimpleSend,
}

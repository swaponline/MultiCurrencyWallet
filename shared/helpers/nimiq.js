const ethKeyToKeyPair = (ethKey) => {
  if (!Nimiq) throw new Error('include Nimiq from CDN')

  let raw = ethKey.slice(0,2) == '0x' ? ethKey.substring(2) : ethKey
  let buf = new Buffer(raw, 'hex')

  const privKey = new Nimiq.PrivateKey(buf)
  const publicKey = Nimiq.PublicKey.derive(privKey)
  return new Nimiq.KeyPair(privKey, publicKey)
}

const followTransaction = ($, tx) => new Promise((resolve) => {
  const id = $.mempool.on('transaction-mined', tx2 => {
    if (tx.equals(tx2)) {
      $.mempool.off('transaction-mined', id)
      resolve()
    }
  })
})

const prepareTransaction = ($, address, amount) => {
  let height  = $.blockchain.height + 1
  let addr  = Nimiq.Address.fromUserFriendlyAddress(address)
  let value = Nimiq.Policy.coinsToSatoshis(amount)
  let fee   = Nimiq.Policy.coinsToSatoshis(0)

  return { addr, value, fee, height }
}

export {
  ethKeyToKeyPair,
  followTransaction,
  prepareTransaction,
}

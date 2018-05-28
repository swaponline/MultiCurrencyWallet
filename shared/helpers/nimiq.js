const ethKeyToKeyPair = (ethKey) => {
  if (!window.Nimiq) throw new Error('include Nimiq from CDN')

  const raw         = ethKey.slice(0, 2) === '0x' ? ethKey.substring(2) : ethKey
  const buf         = Buffer.from(raw, 'hex')
  const privKey     = new window.Nimiq.PrivateKey(buf)
  const publicKey   = window.Nimiq.PublicKey.derive(privKey)

  return new window.Nimiq.KeyPair(privKey, publicKey)
}

const followTransaction = ($, tx) =>
  new Promise((resolve) => {
    const id = $.mempool.on('transaction-mined', tx2 => {
      if (tx.equals(tx2)) {
        $.mempool.off('transaction-mined', id)
        resolve()
      }
    })
  })

const prepareTransaction = ($, address, amount) => {
  const height  = $.blockchain.height + 1
  const addr    = window.Nimiq.Address.fromUserFriendlyAddress(address)
  const value   = window.Nimiq.Policy.coinsToSatoshis(amount)
  const fee     = window.Nimiq.Policy.coinsToSatoshis(0)

  return { addr, value, fee, height }
}


export {
  ethKeyToKeyPair,
  followTransaction,
  prepareTransaction,
}

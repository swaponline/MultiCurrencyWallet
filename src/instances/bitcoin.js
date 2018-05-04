import BigInteger from 'bigi'
import bitcoin from 'bitcoinjs-lib'


class Bitcoin {

  constructor() {
    this.core = bitcoin
    this.testnet = bitcoin.networks.testnet
  }

  login(privateKey) {
    let keyPair

    if (privateKey) {
      const hash  = this.core.crypto.sha256(privateKey)
      const d     = BigInteger.fromBuffer(hash)

      keyPair     = new this.core.ECPair(d, null, { network: this.testnet })
    }
    else {
      keyPair     = this.core.ECPair.makeRandom({ network: this.testnet })
      privateKey  = keyPair.toWIF()
    }

    const address     = keyPair.getAddress()
    const account     = new this.core.ECPair.fromWIF(privateKey, this.testnet)
    const publicKey   = account.getPublicKeyBuffer().toString('hex')

    const data = {
      account,
      keyPair,
      address,
      privateKey,
      publicKey,
    }

    console.info('Logged in with Bitcoin', data)

    return data
  }

  getBalance(address) {
    return request.get(`https://test-insight.bitpay.com/api/addr/${address}`)
      .then(({ balance }) => {
        console.log('BTC Balance:', balance)

        return balance
      })
  }

  fetchUnspents(address) {
    return request.get(`https://test-insight.bitpay.com/api/addr/${address}/utxo`)
  }

  broadcastTx(txRaw) {
    return request.post(`https://test-insight.bitpay.com/api/tx/send`, {
      body: {
        rawtx: txRaw,
      },
    })
  }
}


export default new Bitcoin()

export {
  Bitcoin,
}

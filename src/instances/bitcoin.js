import BigInteger from 'bigi'
import request from './request'
import config from '../helpers/config'
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
    };

    console.info('Logged in with Bitcoin', data);

    return data
  }

  // getBalance(address) {
  //   return "?"
  //   // return request.get(`https://test-insight.bitpay.com/api/addr/${address}`)
  //   //   .then(({ balance }) => {
  //   //     console.log('BTC Balance:', balance);
  //   //     return balance
  //   //   })
  // }
  getTransaction(address) {

    return new Promise((resolve) => {

        const url = `https://api.blocktrail.com/v1/tBTC/address/${address}/transactions?api_key=${config.apiKeys.blocktrail}`
        let transactions
        request.get(url).then((res) => {
          if (res.total) {
            transactions = res.data.map((item) => ({
              status: item.block_hash != null ? 1 : 0,
              value: item.outputs[0].value / 1e8,
              address: item.outputs[0].address,
              date: item.time,
              type: address.toLocaleLowerCase() === item.outputs[0].address.toLocaleLowerCase() ? 'in' : 'out'
            }))

            EA.dispatch('btc:updateTransactions', transactions.reverse())
            resolve(transactions)
          }
          else {
            console.log('res:status BTC false', res)
          }
        })

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

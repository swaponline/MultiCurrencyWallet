import BigInteger from 'bigi'
import { config, request } from 'helpers'
import bitcoin from 'bitcoinjs-lib'


class Bitcoin {

  constructor() {
    this.core = bitcoin
    this.testnet = bitcoin.networks.testnet
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

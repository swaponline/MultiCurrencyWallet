import BigInteger from 'bigi'
import request from '../../local_modules/request'
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
      console.info('Created account Bitcoin ...')
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

  getTransaction(address) {
    return new Promise((resolve) => {

      const url = `https://api.blocktrail.com/v1/tBTC/address/${address}/transactions?api_key=${config.apiKeys.blocktrail}`
      let transactions

      let options = {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }

      request.get(url).then((res) => {
        if (res.total) {
          transactions = res.data.map((item) => ({
            type: 'btc',
            status: item.block_hash != null ? 1 : 0,
            value: item.outputs[0].value / 1e8,
            address: item.outputs[0].address,
            date: new Date(Date.parse(item.time)).toLocaleString('en-US', options),
            direction: address.toLocaleLowerCase() === item.outputs[0].address.toLocaleLowerCase() ? 'in' : 'out',
          }))
          resolve(transactions)
        }
        else {
          console.error('res:status BTC false', res)
        }
      })

    })
  }

  send(from, to, amount, keyPair) {
    return new Promise((resolve, reject) => {
      const newtx = {
        inputs: [
          {
            addresses: [from],
          },
        ],
        outputs: [
          {
            addresses: [to],
            value: amount * 100000000,
          },
        ],
      }
      console.log('withdraw 0')
      request.post('https://api.blockcypher.com/v1/btc/test3/txs/new', {
        body: JSON.stringify(newtx),
      }).then((d) => {
        console.log('withdraw 1')
        // convert response body to JSON
        let tmptx = d

        // attribute to store public keys
        tmptx.pubkeys = []


        // build signer from WIF
        let keys = new this.core.ECPair.fromWIF(keyPair.toWIF(), this.testnet)

        // iterate and sign each transaction and add it in signatures while store corresponding public key in pubkeys
        tmptx.signatures = tmptx.tosign.map((tosign, n) => {
          tmptx.pubkeys.push(keys.getPublicKeyBuffer().toString('hex'))

          return keys.sign(BigInteger.fromHex(tosign.toString('hex')).toBuffer()).toDER().toString('hex')
        })

        return request.post('https://api.blockcypher.com/v1/btc/test3/txs/send', {
          body: JSON.stringify(tmptx),
        })
      })
        .then((res) => resolve(res)).catch((e) => console.log(e))
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

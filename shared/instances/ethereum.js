import Web3 from 'web3'
import config from '../helpers/config'
import request from '../../local_modules/request'

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/5lcMmHUURYg8F20GLGSr'))

class Ethereum {

  constructor() {
    this.core = web3
    this.maxGas = 35000
  }

  login(privateKey) {
    let data
    if (privateKey) {
      data = this.core.eth.accounts.privateKeyToAccount(privateKey)
    } else {
      console.info('Created account Ethereum ...')
      data = this.core.eth.accounts.create()
      this.core.eth.accounts.wallet.add(data)
    }

    this.core.eth.accounts.wallet.add(data.privateKey)
    console.info('Logged in with Ethereum', data)

    return data
  }

  getBalance(address) {
    return this.core.eth.getBalance(address)
      .then(wei => {
        const balance = Number(this.core.utils.fromWei(wei, 'ether'))
        console.log('ETH Balance:', balance)
        return balance
      })
  }

  getGas() {
    this.core.eth.getGasPrice().then((res) => {
      this.gasPrice = this.core.utils.fromWei(res)
    })
  }

  getTransaction(address) {
    return new Promise((resolve) => {
      const url = `http://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${config.apiKeys.eth}`
      let transactions

      let options = {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }

      request.get(url)
        .then((res) => {
          if (res.status) {
            transactions = res.result
              .filter((item) => item.value > 0).map((item) => ({
                type: 'eth',
                status: item.blockHash != null ? 1 : 0,
                value: this.core.utils.fromWei(item.value),
                address: item.to,
                date: new Date(item.timeStamp * 1000).toLocaleString('en-US', options),
                direction: address.toLowerCase() === item.to.toLowerCase() ? 'in' : 'out',
              }))
            resolve(transactions)
          } else { console.error('res:status ETH false', res) }
        })
    })
  }


  async send(from, to, amount, privateKey) {
    await this.getGas()
    return new Promise((resolve, reject) => {
      this.core.eth.getBalance(from).then((r) => {
        try {
          let balance = this.core.utils.fromWei(r)

          if (balance === 0) {
            reject('Your balance is empty')
            return
          }

          const t = {
            from,
            to,
            gas:  this.maxGas,
            gasPrice: web3.utils.toWei(`${this.gasPrice}`),
            value: web3.utils.toWei(`${amount}`),
          }

          this.core.eth.accounts.signTransaction(t, privateKey)
            .then((result) => this.core.eth.sendSignedTransaction(result.rawTransaction))
            .then((receipt) => {
              resolve(receipt)
            })
            .catch(error => console.error(error))
        }
        catch (e) {
          console.error(e)
        }
      })
    })
  }
}


export default new Ethereum()

export {
  Ethereum,
  web3,
}

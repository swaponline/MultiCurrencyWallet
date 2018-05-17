import bitcoin from './bitcoin'
import ethereum from './ethereum'
import request from '../../local_modules/request'

class User {
  constructor() {
    this.ethData = {
      address: '0x0',
      publicKey: '0x0',
      balance: 0,
    }
    this.btcData = {
      address: '0x0',
      publicKey: '0x0',
      balance: 0,
    }
  }

  sign() {
    const ethPrivateKey = localStorage.getItem('privateEthKey')
    this.ethData = ethereum.login(ethPrivateKey)
    localStorage.setItem('privateEthKey', this.ethData.privateKey)
    localStorage.setItem('addressEth',  this.ethData.address)

    const btcPrivateKey = localStorage.getItem('privateBtcKey')
    this.btcData = bitcoin.login(btcPrivateKey)
    localStorage.setItem('privateBtcKey', this.btcData.privateKey)
    localStorage.setItem('addressBtc', this.btcData.address)
  }

  async getBalances(currency = 'all') {
    if (currency === 'eth' || currency === 'all') {
      this.ethData.balance = await ethereum.getBalance(this.ethData.address)
    }
    if (currency === 'btc' || currency === 'all') {
      this.btcData.balance = await bitcoin.getBalance(this.btcData.address)
    }
  }

  async getTransactions() {
    return Promise.all([
      bitcoin.getTransaction(this.btcData.address), // mjzGEPuqpRxqJ1JmdLMw1kXruEiW3L6ciX this.btcData.address
      ethereum.getTransaction(this.ethData.address), // 0xad1Ea60734dEb6dE462ae83F400b10002236539b this.ethData.address
    ]).then(transactions => {
      let data = [].concat.apply([], ...transactions).sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      return data
    })
  }

  getDemoMoney = () => {
    request.get('https://swap.online/demokeys.php', {})
      .then((r) => {
        localStorage.setItem('privateBtcKey', r[0])
        localStorage.setItem('privateEthKey', r[1])
        global.location.reload()
      })
  }

  async getData() {
    await this.sign()
    await this.getBalances()
    return [
      {
        currency: 'btc',
        address: this.btcData.address,
        publicKey: this.btcData.publicKey,
        balance: this.btcData.balance,
      },
      {
        currency: 'eth',
        address: this.ethData.address,
        publicKey: this.ethData.publicKey,
        balance: this.ethData.balance,
      },
    ]
  }
}

export default new User()

export {
  User,
}

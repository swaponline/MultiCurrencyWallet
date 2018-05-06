import bitcoin from './bitcoin'
import ethereum from './ethereum'

class User {
    constructor() {
        this.ethData = {
            address: '0x0',
            balance: 0
        },
        this.btcData = {
            address: '0x0',
            balance: 0
        }
    }

    sign() {
        const ethPrivateKey = localStorage.getItem('privateEthKey')
        const btcPrivateKey = localStorage.getItem('privateBtcKey')

        this.ethData = ethereum.login(ethPrivateKey)
        this.btcData = bitcoin.login(btcPrivateKey)
    }

    async getBalances(currency='all') {
        if (currency === 'eth' || currency ==='all') {
          this.ethData.balance = await ethereum.getBalance(this.ethData.address)
        }
        if (currency === 'btc' || currency === 'all') {
          this.btcData.balance = await bitcoin.getBalance(this.btcData.address)
        }
    }

    getTransactions() {
        ethereum.getTransaction(this.ethData.address)
        bitcoin.getTransaction(this.btcData.address)
    }
}

export default new User()
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
        bitcoin.getTransaction(this.btcData.address)
        ethereum.getTransaction('0xad1Ea60734dEb6dE462ae83F400b10002236539b')
    }
}

export default new User()
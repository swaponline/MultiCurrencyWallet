import bitcoin from './bitcoin'
import ethereum from './ethereum'

class User {
    constructor() {
        this.ethData = {
            address: '0x0',
            balance: 0,
            history: ''
        },
        this.btcData = {
            address: '0x0',
            balance: 0,
            history: ''
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

    async getBalances(currency='all') {
        if (currency === 'eth' || currency ==='all') {
          this.ethData.balance = await ethereum.getBalance(this.ethData.address)
        }
        if (currency === 'btc' || currency === 'all') {
          this.btcData.balance = await bitcoin.getBalance(this.btcData.address)
        }
    }

    async getTransactions() {
        // this.btcData.history = await bitcoin.getTransaction('17Hz5MouBvysRtnnhK5g22E9gMupL57zCh')
        this.ethData.history = await ethereum.getTransaction('0xad1Ea60734dEb6dE462ae83F400b10002236539b')
            return [
                {
                    currency: 'BTC',
                    ...this.btcData.history
                },
                {
                    currency: 'ETH',
                    ...this.ethData.history
                }
            ]
    }
    

    async getData() {
        await this.sign()
        await this.getBalances()
        return [
            {
                currency: "BTC",
                address: this.btcData.address,
                balance: this.btcData.balance
            },
            {
                currency: "ETH",
                address: this.ethData.address,
                balance: this.ethData.balance
            }
        ]
    }
}

export default new User()
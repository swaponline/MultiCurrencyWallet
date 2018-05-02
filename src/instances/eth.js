import Web3 from 'web3'
import React from 'react'

const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/5lcMmHUURYg8F20GLGSr'))

class Eth extends React.Component {
    constructor() {
        super()

        this.core = web3
        this.maxGas = 35000;
        global.ethereum = this
        global.wallet = this.core.eth.accounts.wallet

    }

    getRate() {
        return new Promise((resolve) => {
            request.get('https://noxonfund.com/curs.php')
            .then(({price_btc}) => {
                resolve(price_btc)
            })
        })
    }

    login(privateKey) {
        let data
        if (privateKey) {
            data = this.core.eth.accounts.privateKeyToAccount(privateKey)
        }
        else { 
            data = this.core.eth.accounts.create()
            this.core.eth.accounts.wallet.add(data)
        }

        this.core.eth.accounts.wallet.add(data.privateKey)

        console.info('Logged in with Ethereum', data)
        EA.dispatch('eth:login', data)

        return data
    }

    getBalance(address) {
        return this.core.eth.getBalance(address)
            .then((wei) => {
                const balance = Number(this.core.utils.fromWei(wei))

                this.getGas()
                EA.dispatch('eth:updateBalance', balance)
                return balance
        })
    }
}

export default new Eth()


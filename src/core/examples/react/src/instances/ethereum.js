import Web3 from 'web3'
import { request } from '../util'


const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl'))

class Ethereum {

  constructor() {
    this.core = web3
  }

  login(privateKey) {
    let account

    if (privateKey) {
      account = this.core.eth.accounts.privateKeyToAccount(privateKey)
    }
    else {
      account = this.core.eth.accounts.create()
      this.core.eth.accounts.wallet.add(account)
    }

    this.core.eth.accounts.wallet.add(account.privateKey)

    console.info('Logged in with Ethereum', account)

    return account
  }

  fetchBalance(address) {
    return this.core.eth.getBalance(address)
      .then((wei) => {
        const balance = Number(this.core.utils.fromWei(wei))

        console.log('ETH balance:', balance)

        return balance
      })
  }

  fetchTokenBalance(tokenAddress, address) {
    return request.get(`https://rinkeby.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${address}`)
      .then(({ result }) => result)
  }
}


export default new Ethereum()

export {
  Ethereum,
  web3,
}

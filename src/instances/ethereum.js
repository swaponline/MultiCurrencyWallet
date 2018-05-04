import Web3 from 'web3'


const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl'))

class Ethereum {

  constructor() {
    this.core = web3
  }

  login() {

      let account
      account = this.core.eth.accounts.create()
      this.core.eth.accounts.wallet.add(account)
      this.core.eth.accounts.wallet.save('test')
      
      return account

  }

  getBalance(address) {
    return this.core.eth.getBalance(address)
      .then(wei => {
        const balance = Number(this.core.utils.fromWei(wei))
        return balance
      })
  }
}


export default new Ethereum()

export {
  Ethereum,
  web3,
}

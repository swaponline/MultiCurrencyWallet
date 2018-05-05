import Web3 from 'web3'

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/5lcMmHUURYg8F20GLGSr'));

class Ethereum {

  constructor() {
    this.core = web3
  }

  login() {
      let ethAccount = this.core.eth.accounts.create();
      this.core.eth.accounts.wallet.add(ethAccount);
      this.core.eth.accounts.wallet.save('test');
      
      return ethAccount
  }

  getBalance(address) {
    return this.core.eth.getBalance(address)
      .then(wei => {
        const balance = this.core.utils.fromWei(wei,"ether");
        return balance
      })
  }
}


export default new Ethereum()

export {
  Ethereum,
  web3,
}

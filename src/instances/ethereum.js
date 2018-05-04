import Web3 from 'web3'
import React from 'react'

const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl'))

class Ethereum extends React.Component {

  constructor() {
    super()
  }

  login(privateKey) {

      let account
      web3.eth.accounts.wallet.load('test', 'web3js_wallet')
      if (privateKey) {
        account = web3.eth.accounts.privateKeyToAccount(privateKey)
      }
      else {
        account = web3.eth.accounts.create()
        web3.eth.accounts.wallet.add(account)
      }
      
      web3.eth.accounts.wallet.add(account.privateKey)
      web3.eth.accounts.wallet.save('test')
      return account

  }

  getBalance(address) {
    return web3.eth.getBalance(address)
      .then(wei => {
        const balance = Number(web3.utils.fromWei(wei))
        return balance
      })
  }
}


export default new Ethereum()

export {
  Ethereum,
  web3,
}

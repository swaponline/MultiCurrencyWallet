import Web3 from 'web3'
import config from 'app-config'

let web3: IEtheriumProvider = new Web3(new Web3.providers.HttpProvider(config.web3.provider))

const setMetamask = async (provider) => {
  web3 = provider
  web3.isMetamask = true
}

const setProvider = (provider) => {
  web3 = provider
}
const setDefaultProvider = () => {
  web3 = new Web3(new Web3.providers.HttpProvider(config.web3.provider))
  web3.isMetamask = false
}

const getWeb3 = () => {
  console.log('get web3 - is metamask', web3.isMetamask)
  return web3
}

// Add custom request function in window.ethereum (equal web3.currentProvider)

const proxyRequest = new Proxy(() => null, {
  /**
   * @param target original function: () => null
   * @param thisArg window ethereum object
   * @param args array with target arguments
   */
  apply(target, thisArg, args) {
    const web3Eth = window.web3.eth
    const internalAddressArr = [web3.eth.accounts.wallet[0].address]
    const method = args[0].method
    const params = args[0].params

    return new Promise((response, reject) => {
      try {
        switch (method) {
          case 'eth_accounts':
            response(internalAddressArr) // web3Eth.getAccounts()
          case 'eth_gasPrice':
            response(web3Eth.getGasPrice())
          case 'eth_sendTransaction':
            response(web3Eth.sendTransaction(params[0]))
          case 'eth_getTransactionReceipt':
            response(web3Eth.getTransactionReceipt(params[0].transactionHash))
          case 'eth_getCode':
            response(web3Eth.getCode(params[0]))
          default:
            reject('Ethereum proxy: unknown method')
        }
      } catch (error) {
        throw new Error(error)
      }
    })
  }
})

const ethProxyHandler = {
  get(target, prop) {
    if (prop === 'request') {
      return proxyRequest
    }
  }
}

const ethereumProxy = new Proxy(web3.currentProvider, ethProxyHandler)

export {
  setMetamask,
  web3,
  getWeb3,
  setDefaultProvider,
  setProvider,
  ethereumProxy,
}

export default web3

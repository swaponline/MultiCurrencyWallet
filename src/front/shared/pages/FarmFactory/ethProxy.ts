import { web3 } from 'helpers'

const proxyRequest = new Proxy(() => null, {
  /**
   * @param target source request function
   * @param thisArg ethereum obj
   * @param args array with request's arguments
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

const handler = {
  get(target, prop) {
    if (prop === 'request') {
      return proxyRequest
    }
  }
}

export const ethProxy = new Proxy(web3.currentProvider, handler)
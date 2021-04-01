import Web3 from 'web3'
import config from 'app-config'
import helpers from 'helpers'

console.log('reset web3')
let web3: IEtheriumProvider = new Web3(
  new Web3.providers.HttpProvider(
    (config.binance)
      ? config.web3.binance_provider
      : config.web3.provider
  )
)

const setMetamask = async (provider) => {
  web3 = provider
  web3.isMetamask = true
}

const setProvider = (provider) => {
  web3 = provider
}

const setDefaultProvider = () => {
  web3 = new Web3(
    new Web3.providers.HttpProvider(
      (config.binance)
        ? config.web3.binance_provider
        : config.web3.provider
    )
  )

  web3.isMetamask = false
}

const getWeb3 = () => {
  console.log('get web3 - is metamask', web3.isMetamask)
  return web3
}

/**
 * Below - proxy functions for window.ethereum which are used by Farm plugin.
 * These are methods that aren't in the custom ethereum object.
 * Imitation of metamask interface.
 */

const proxyRequest = new Proxy(() => null, {
  /**
   * @function {target} original function
   * @param {thisArg} window ethereum object
   * @param {args} array with target arguments
   */
  apply(target, thisArg, args) {
    if (!window.web3.eth) {
      throw new Error('Ethereum proxy - in the method<request>: window.web3.eth is undefined')
    }

    return new Promise((response, reject) => {
      try {
        response(proxyRequestResult(args))
      } catch (error) {
        reject(error)
      }
    })
  }
})

const proxyRequestResult = async (args) => {
  const web3Eth = window.web3.eth
  const internalAddressArr = [web3Eth.accounts.wallet[0].address]
  const method = args[0].method
  const params = args[0].params
  let result = undefined

  switch (method) {
    case 'eth_accounts':
      result = internalAddressArr
      break
    case 'eth_gasPrice':
      result = await web3Eth.getGasPrice()
      break
    case 'eth_sendTransaction':
      const fullParameters = await returnCompletedSendTxParams(params[0])
      result = await web3Eth.sendTransaction(fullParameters)
      break
    case 'eth_getTransactionReceipt':
      result = await web3Eth.getTransactionReceipt(params[0].transactionHash)
      break
    case 'eth_getCode':
      result = await web3Eth.getCode(params[0])
      break
    case 'eth_call':
      // params[0] - data
      // params[1] - block number (there is 'latest')
      result = await web3Eth.call(params[0], params[1])
      break
    default:
      throw new Error(`Ethereum proxy - in the method<request>: unknown method: ${method}`)
  }

  return result
}

// not enough parameters for transaction
// need to add your owns
const returnCompletedSendTxParams = async (params) => {
  const gasPrice = params.gasPrice || await helpers.eth.estimateGasPrice()
  let gasLimit = params.gasLimit

  if (!gasLimit) {
    const lastBlock = await web3.eth.getBlock("latest")
    gasLimit = lastBlock.gasLimit
  }

  return {
    ...params,
    gas: gasLimit,
    gasPrice,
    gasLimit,
  }
}

const ethProxyHandler = {
  get(target, prop) {
    // mainnet - 1, ropsten - 3
    const networkVersion = config.entry === 'testnet' ? 3 : 1

    switch (prop) {
      case 'networkVersion':
        return networkVersion;
      case 'request':
        return proxyRequest
      /**
       * Method 'on' is called by plugin, with only one
       * event - networkChanged, but we don't use metamask
       * in this case and user can't change the network.
       * Just return a function that does nothing
       */
      case 'on':
        return () => null
    }
  }
}

const getCurrentWeb3 = () => {
  return web3
}
window.getCurrentWeb3 = getCurrentWeb3

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

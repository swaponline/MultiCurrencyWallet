// import { EventEmitter } from 'events';
import Web3 from 'web3'
import config from 'app-config'

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
 * Below - proxy functions for window.ethereum.
 * These are methods that aren't in the custom ethereum object.
 * Imitation of metamask interface.
 */

const proxyRequest = new Proxy(() => null, {
  /**
   * @function target original function
   * @param thisArg window ethereum object
   * @param args array with target arguments
   */
  apply(target, thisArg, args) {
    console.log('Method<request> proxy - arguments: ', args)

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
  /**
   * Unused methods:
   * 
   * @method eth_requestAccounts 
   * Will useful if localStorage key 'ff-account-unlocked'
   * like falsy value (will show a modal window for metamask connection).
   */
  const asyncResult = async (callback, args?) => await callback(args)

  switch (method) {
    case 'eth_accounts':
      result = internalAddressArr
      break
    case 'eth_gasPrice':
      result = asyncResult(web3Eth.getGasPrice)
      break
    case 'eth_sendTransaction':
      result = asyncResult(web3Eth.sendTransaction, params[0])
      break
    case 'eth_getTransactionReceipt':
      result = asyncResult(web3Eth.getTransactionReceipt, params[0].transactionHash)
      break
    case 'eth_getCode':
      result = asyncResult(web3Eth.getCode, params[0])
      break
    case 'eth_call':
      // FIXME: main problem at the moment
      // something wrong with data options in the parameters
      // data - signature and parameters hash
      // returned - value of executed contract
      result = null // asyncResult(web3Eth.call, params[0])
      break
    default:
      throw new Error(`Ethereum proxy - in the method<request>: unknown method: ${method}`)
  }

  console.log(`${args[0].method}: result ->`, result)
  return result
}

/**
 * function proxy is called from plugin
 * don't delete it
 */
const proxyOn = new Proxy(() => null, {
  apply(target, thisArg, args) {
    console.log('Method<on> proxy - arguments: ', args)

    // const myEmitter = new EventEmitter()
    // const event = args[0]
    // const handler = args[1]

    // try {
    //   myEmitter.on('networkChanged', () => handler())
    //   myEmitter.on('data', () => handler())
    //   myEmitter.on('connect', () => handler())
    //   myEmitter.on('error', () => handler())
    //   myEmitter.on('close', () => handler())
    //   myEmitter.on('disconnect', () => handler())

    //   switch (event) {
    //     case 'networkChanged':
    //       myEmitter.emit('networkChanged')
    //       break
    //     case 'data':
    //       myEmitter.emit('data')
    //       break
    //     case 'connect':
    //       myEmitter.emit('connect')
    //       break
    //     case 'error':
    //       myEmitter.emit('error')
    //       break
    //     case 'close':
    //       myEmitter.emit('close')
    //       break
    //     case 'disconnect':
    //       myEmitter.emit('disconnect')
    //       break
    //   }
    // } catch (error) {
    //   throw new Error(error)
    // }
  }
})

const ethProxyHandler = {
  get(target, prop) {
    // mainnet - 1, ropsten - 3
    const networkVersion = config.entry === 'testnet' ? 3 : 1

    switch (prop) {
      case 'networkVersion':
        return networkVersion;
      case 'request':
        return proxyRequest
      case 'on':
        return proxyOn
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

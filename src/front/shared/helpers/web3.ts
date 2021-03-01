import { EventEmitter } from 'events';
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

    const web3Eth = window.web3.eth
    
    if (!web3Eth) {
      throw new Error('Ethereum proxy - in the method<request>: window.web3.eth is undefined')
    }

    const internalAddressArr = [web3.eth.accounts.wallet[0].address]
    const method = args[0].method
    const params = args[0].params

    return new Promise((response, reject) => {
      try {
        switch (method) {
          case 'eth_accounts':
            response(internalAddressArr)
          case 'eth_gasPrice':
            response(web3Eth.getGasPrice())
          case 'eth_sendTransaction':
            response(web3Eth.sendTransaction(params[0]))
          case 'eth_getTransactionReceipt':
            response(web3Eth.getTransactionReceipt(params[0].transactionHash))
          case 'eth_getCode':
            response(web3Eth.getCode(params[0]))
          case 'eth_call':
            // FIXME: main problem at the moment
            // something wrong with data options in the parameters
            // data - signature and params hash
            // returned - value of executed contract
            response(null) // web3Eth.call(params[0])
          default:
            reject(`Ethereum proxy - in the method<request>: unknown method: ${method}`)
        }
      } catch (error) {
        reject(error)
      }
    })
  }
})
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

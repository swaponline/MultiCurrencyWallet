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
    // FIXME: delete
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
   * Unused:
   * 
   * @method eth_requestAccounts 
   * Will useful if localStorage key 'ff-account-unlocked'
   * like falsy value (will show a modal window for metamask connection).
   */
  switch (method) {
    case 'eth_accounts':
      result = internalAddressArr
      break
    case 'eth_gasPrice':
      result = await web3Eth.getGasPrice()
      break

    // TODO: An error for transaction to contract
    // not enough parameters for transaction
    // need to create your owns
    case 'eth_sendTransaction':
      const defaultGas = 90_000
      const gasLimit = 90_000
      params[0].gas = defaultGas
      params[0].gasLimit = gasLimit
      result = await web3Eth.sendTransaction(params[0])
      break

    case 'eth_getTransactionReceipt':
      result = await web3Eth.getTransactionReceipt(params[0].transactionHash)
      break
    case 'eth_getCode':
      result = await web3Eth.getCode(params[0])
      break

    // method for a main initialization with farm and tokens addresses
    // FIXME: problem
    // first two calls for staking token (xeenus for now)
    // second two calls for rewards token (weenus for now)
    // this calls return (in hex format) 1) token symbol 2) token decimals
    // after that we get error and several wrong results (just '0x') 
    // when again call method for user account 
    // 
    // TIP: problem with timer initialization
    //
    // data - method id
    // to - contract address
    // returned - value of executed contract
    case 'eth_call':
      // params[0] - data
      // params[1] - block number (there is 'latest')
      // null or undefined in result can hide the error
      // result = '0x0000000000000000000000000000000000000000000000000000000000000000'
      result = await web3Eth.call(params[0], params[1])
      break

    default:
      throw new Error(`Ethereum proxy - in the method<request>: unknown method: ${method}`)
  }

  // FIXME: delete
  console.log(`${args[0].method}: result ->`, result)
  // resolve problem with timer (if period of finish is'n defined then will return 0x)
  if (result === '0x') {
    result = '0x0000000000000000000000000000000000000000000000000000000000000000'
  }

  return result
}

/**
 * function is called from plugin
 * TODO: what exactly is called from plugin
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

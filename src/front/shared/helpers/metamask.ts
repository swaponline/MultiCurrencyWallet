/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-async-promise-executor */
import reducers from 'redux/core/reducers'
import actions from 'redux/actions'
import { cacheStorageGet, cacheStorageSet, constants } from 'helpers'
import config from './externalConfig'
import { setMetamask, setProvider, setDefaultProvider, getWeb3 as getDefaultWeb3 } from 'helpers/web3'
import SwapApp from 'swap.app'
import Web3Connect from 'common/web3connect'
import { COIN_DATA, COIN_MODEL } from 'swap.app/constants/COINS'
import getCoinInfo from 'common/coins/getCoinInfo'
import getState from './getReduxState'

let web3connect: any

const { user: { metamaskData } } = getState()

setWeb3connect((metamaskData?.networkVersion) ? metamaskData.networkVersion : config.evmNetworks.ETH.networkVersion)

function handleConnected() {
  localStorage.setItem(constants.localStorage.isWalletCreate, 'true')
  _onWeb3Changed(web3connect.getWeb3())
}

function handleDisconnected() {
  setDefaultProvider()
  _onWeb3Changed(getDefaultWeb3())
}

function handleAccountChanged() {
  _onWeb3Changed(web3connect.getWeb3())
}

function handleChainChanged() {
  if (web3connect.isCorrectNetwork()) {
    _onWeb3Changed(web3connect.getWeb3())
  }
}

function cleanWeb3connectListeners() {
  web3connect.removeListener('connected', handleConnected)
  web3connect.removeListener('disconnect', handleDisconnected)
  web3connect.removeListener('accountChange', handleAccountChanged)
  web3connect.removeListener('chainChanged', handleChainChanged)
}

function setWeb3connect(networkId) {
  const newNetworkData = Object.values(config.evmNetworks)
    .find((networkInfo: IUniversalObj) => networkInfo.networkVersion === networkId) as EvmNetworkConfig

  if (newNetworkData) {
    if (web3connect) {
      cleanWeb3connectListeners()
    }

    web3connect = new Web3Connect({
      web3ChainId: newNetworkData.chainId,
      web3RPC: {
        [newNetworkData.networkVersion]: newNetworkData.rpcUrls[0],
      },
    })

    web3connect.on('connected', handleConnected)
    web3connect.on('disconnect', handleDisconnected)
    web3connect.on('accountChange', handleAccountChanged)
    web3connect.on('chainChanged', handleChainChanged)
  }
}

const getWeb3connect = () => web3connect

const _onWeb3Changed = (newWeb3) => {
  setProvider(newWeb3)
  // @ts-ignore: strictNullChecks
  SwapApp.shared().setWeb3Provider(newWeb3)
  addMetamaskWallet()
  actions.user.loginWithTokens()
  actions.user.getBalances()
}

const isEnabled = () => true

const isConnected = () => web3connect?.isConnected()

const getAddress = () => (isConnected()) ? web3connect.getAddress() : ``

const getWeb3 = () => (isConnected()) ? web3connect.getWeb3() : false

const web3connectInit = async () => {
  await web3connect.onInit(async () => {
    if (web3connect.hasCachedProvider()) {
      let _web3: EthereumProvider | false = false

      try {
        _web3 = web3connect.getWeb3()
      } catch (err) {
        web3connect.clearCache()
        addMetamaskWallet()
        return
      }

      setMetamask(_web3)
      addMetamaskWallet()

      await actions.user.sign()
      await actions.user.getBalances()
    } else {
      addMetamaskWallet()
    }
  })
}

const addWallet = () => {
  addMetamaskWallet()
  if (isConnected() && isAvailableNetwork()) {
    getBalance()
  }
}

const getBalance = () => {
  const { user: { metamaskData } } = getState()
  if (metamaskData) {
    const { address, currency } = metamaskData
    const balanceInCache = cacheStorageGet('currencyBalances', `${currency}_${address}`)

    if (balanceInCache !== false) {
      reducers.user.setBalance({
        name: 'metamaskData',
        amount: balanceInCache,
      })
      return balanceInCache
    }

    return web3connect.getWeb3().eth.getBalance(address)
      .then(result => {
        const amount = web3connect.getWeb3().utils.fromWei(result)

        cacheStorageSet('currencyBalances', `${currency}_${address}`, amount, 30)
        reducers.user.setBalance({ name: 'metamaskData', amount })
        return amount
      })
      .catch((error) => {
        console.error('fail get balance')
        console.error('error', error)
        reducers.user.setBalanceError({ name: 'metamaskData' })
      })
  }
}

const disconnect = () => new Promise(async (resolved) => {
  if (isConnected()) {
    await web3connect.Disconnect()

    resetWalletState()
    resolved(true)
  } else {
    resolved(true)
  }
})

const connect = (options) => new Promise(async (resolved, reject) => {
  actions.modals.open(constants.modals.ConnectWalletModal, {
    ...options,
    onResolve: resolved,
    onReject: reject,
  })
})

/* metamask wallet layer */
const isCorrectNetwork = () => web3connect.isCorrectNetwork()

const getChainId = () => {
  const hexChainId = web3connect.getChainId()

  return Number(Number(hexChainId).toString(10))
}

const isAvailableNetwork = () => {
  const networkVersion = getChainId()

  const existsNetwork = Object.keys(config.evmNetworks).filter((key) => {
    return (config.evmNetworks[key].networkVersion == networkVersion)
  })
  if (existsNetwork.length) {
    if (config.opts.curEnabled && !config.opts.curEnabled[existsNetwork[0].toLowerCase()]) {
      return false
    }
  }
  return (config.evmNetworkVersions.includes(networkVersion))
}

const isAvailableNetworkByCurrency = (currency) => {
  const { blockchain } = getCoinInfo(currency)
  const ticker = currency.toUpperCase()

  const isUTXOModel = COIN_DATA[ticker]?.model === COIN_MODEL.UTXO

  if (isUTXOModel) return false

  const currencyNetworkVersion = (blockchain)
    ? config.evmNetworks[blockchain]?.networkVersion
    : config.evmNetworks[ticker]?.networkVersion

  const currentNetworkVersion = getChainId()

  return currencyNetworkVersion === currentNetworkVersion
}

const addMetamaskWallet = () => {
  if (isConnected()) {
    const networkVersion = getChainId()

    if (isAvailableNetwork()) {
      const { user } = getState()
      const currentNetworkData = Object.values(config.evmNetworks)
        .find((networkInfo: EvmNetworkConfig) => networkInfo.networkVersion === networkVersion) as EvmNetworkConfig

      const { currency } = currentNetworkData
      const fullName = `${currency} (${web3connect.getProviderTitle()})`
      const infoAboutCurrency = user[`${currency.toLowerCase()}Data`]?.infoAboutCurrency

      reducers.user.addWallet({
        name: 'metamaskData',
        data: {
          address: getAddress(),
          balance: 0,
          balanceError: false,
          isConnected: true,
          isMetamask: true,
          currency,
          fullName,
          infoAboutCurrency,
          isBalanceFetched: true,
          unconfirmedBalance: 0,
          networkVersion,
          unknownNetwork: false,
        },
      })
    } else {
      reducers.user.addWallet({
        name: 'metamaskData',
        data: {
          address: `Please choose another`,
          balance: 0,
          balanceError: false,
          isConnected: true,
          isMetamask: true,
          currency: 'ETH',
          fullName: `Unknown network (${web3connect.getProviderTitle()})`,
          infoAboutCurrency: undefined,
          isBalanceFetched: true,
          unconfirmedBalance: 0,
          networkVersion,
          unknownNetwork: true,
        },
      })
    }
  } else {
    resetWalletState()
  }
}

const resetWalletState = () => {
  reducers.user.addWallet({
    name: 'metamaskData',
    data: {
      address: 'Not connected',
      balance: 0,
      balanceError: false,
      isConnected: false,
      isMetamask: true,
      currency: 'ETH',
      fullName: 'External wallet',
      infoAboutCurrency: undefined,
      isBalanceFetched: true,
      unconfirmedBalance: 0,
    },
  })
}

if (web3connect?.hasCachedProvider && web3connect.hasCachedProvider()) {
  web3connectInit()
} else {
  addMetamaskWallet()
}

const handleDisconnectWallet = (callback?) => {
  if (isConnected()) {
    disconnect().then(async () => {
      await actions.user.sign()
      await actions.user.getBalances()

      if (typeof callback === 'function') {
        callback()
      }
    })
  }
}

type MetamaskConnectParams = {
  dontRedirect?: boolean
  callback?: (boolean) => void
}

const handleConnectMetamask = (params: MetamaskConnectParams = {}) => {
  const { callback } = params

  connect(params).then(async (connected) => {
    if (connected) {
      await actions.user.sign()
      await actions.user.getBalances()

      if (typeof callback === 'function') {
        callback(true)
      }
    } else {
      if (typeof callback === 'function') {
        callback(false)
      }
    }
  })
}

const switchNetwork = async (nativeCurrency) => {
  const { chainId } = config.evmNetworks[nativeCurrency]

  if (!window.ethereum) return false

  try {
    const result = await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    })

    // null is a successful result
    return result === null
  } catch (switchError) {
    const tipAddNetwork = JSON.stringify(switchError).match(/(T|t)ry adding the chain/)

    if (switchError.code === 4902 || tipAddNetwork) {
      try {
        return await addCurrencyNetwork(nativeCurrency)
      } catch (addError) {
        console.group('%c add a new Metamask network', 'color: red;')
        console.log(addError)
        console.groupEnd()
      }
      // show the error if it's not a rejected request
    } else if (switchError.code !== 4001) {
      console.group('%c switch the Metamask network', 'color: red;')
      console.log(switchError)
      console.groupEnd()
    }
  }
}

const addCurrencyNetwork = async (currency) => {
  if (!(isConnected())) {
    return false
  }

  const { coin, blockchain } = getCoinInfo(currency)
  const nativeCurrency = blockchain || coin.toUpperCase()

  const {
    chainId,
    chainName,
    rpcUrls,
    blockExplorerUrls,
  } = config.evmNetworks[nativeCurrency]

  const {
    name,
    ticker: symbol,
    precision: decimals,
  } = COIN_DATA[nativeCurrency]

  const params = {
    chainId,
    chainName,
    nativeCurrency: {
      name,
      symbol, // 2-6 characters long
      decimals,
    },
    rpcUrls,
    blockExplorerUrls,
  }

  const web3 = web3connect.getWeb3()
  const { ethereum } = window

  if (web3.eth  && ethereum) {
    return new Promise((res, rej) => {
      web3.eth.getAccounts((error, accounts) => {
        ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [params, accounts[0]],
        })
          .then(() => {
            console.log('Success add and switch to network')
            res(true)
          })
          .catch((error) => {
            rej(new Error(`Metamask > addCurrencyNetwork error: ${error.message}`))
          })
      })
    })
  }
  throw new Error('Can not access to web3 or ethereum')

}

const metamaskApi = {
  connect,
  isEnabled,
  isConnected,
  getAddress,
  web3connect,
  setWeb3connect,
  getWeb3connect,
  web3connectInit,
  addWallet,
  getBalance,
  getWeb3,
  getChainId,
  disconnect,
  isCorrectNetwork,
  isAvailableNetwork,
  isAvailableNetworkByCurrency,
  handleDisconnectWallet,
  handleConnectMetamask,
  switchNetwork,
  addCurrencyNetwork,
}

window.metamaskApi = metamaskApi

export default metamaskApi

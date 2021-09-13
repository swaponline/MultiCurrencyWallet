import reducers from 'redux/core/reducers'
import getState from './getReduxState'
import actions from 'redux/actions'
import { cacheStorageGet, cacheStorageSet, constants } from 'helpers'
import config from 'app-config'
import { setMetamask, setProvider, setDefaultProvider, getWeb3 as getDefaultWeb3 } from 'helpers/web3'
import SwapApp from 'swap.app'
import Web3Connect from 'common/web3connect'
import { COIN_DATA, COIN_MODEL } from 'swap.app/constants/COINS'
import getCoinInfo from 'common/coins/getCoinInfo'

let web3connect: IUniversalObj = new Web3Connect({
  web3ChainId: config.evmNetworks.ETH.chainId,
  web3RPC: {
    // for now we can use only one chain at time for the external wallets
    [config.evmNetworks.ETH.networkVersion]: config.evmNetworks.ETH.rpcUrls[0],
  },
})

const setWeb3connect = async (coinName) => {
  const newNetworkData = config.evmNetworks[coinName.toUpperCase()]

  web3connect = new Web3Connect({
    web3ChainId: newNetworkData.chainId,
    web3RPC: {
      [newNetworkData.networkVersion]: newNetworkData.rpcUrls[0],
    },
  })
}

const getWeb3connect = () => {
  return web3connect
}

const _onWeb3Changed = (newWeb3) => {
  setProvider(newWeb3)
  //@ts-ignore: strictNullChecks
  SwapApp.shared().setWeb3Provider(newWeb3)
  addMetamaskWallet()
  actions.user.loginWithTokens()
  actions.user.getBalances()
}

web3connect.on('connected', async () => {
  localStorage.setItem(constants.localStorage.isWalletCreate, 'true')

  _onWeb3Changed(web3connect.getWeb3())
})

web3connect.on('disconnect', async () => {
  setDefaultProvider()
  _onWeb3Changed(getDefaultWeb3())
})

web3connect.on('accountChange', async () => {
  _onWeb3Changed(web3connect.getWeb3())
})

web3connect.on('chainChanged', async () => {
  _onWeb3Changed(web3connect.getWeb3())
})

const isEnabled = () => true

const isConnected = () => {
  const web3connect = getWeb3connect()

  return web3connect.isConnected()
}

const getAddress = () => (isConnected()) ? web3connect.getAddress() : ``

const getWeb3 = () => (isConnected()) ? web3connect.getWeb3() : false

const web3connectInit = async () => {
  await web3connect.onInit(async () => {
    if (web3connect.hasCachedProvider()) {
      let _web3: IEtheriumProvider | false = false

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

    //@ts-ignore: strictNullChecks
    return web3connect.getWeb3().eth.getBalance(address)
      .then(result => {
        //@ts-ignore: strictNullChecks
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

const disconnect = () => new Promise(async (resolved, reject) => {
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

    return (config.evmNetworkVersions.includes(networkVersion))
}

const isAvailableNetworkByCurrency = (currency) => {
  const { blockchain } = getCoinInfo(currency)
  const ticker = currency.toUpperCase()

  const isUTXOModel = COIN_DATA[ticker]?.model === COIN_MODEL.UTXO

  if (isUTXOModel) return false

  const currencyNetworkVersion =
    (blockchain)
    ? config.evmNetworks[blockchain]?.networkVersion
    : config.evmNetworks[ticker]?.networkVersion

  const hexChainId = web3connect.getChainId()
  const currentNetworkVersion = Number(Number(hexChainId).toString(10))

  return currencyNetworkVersion === currentNetworkVersion
}

const addMetamaskWallet = () => {
  const { user } = getState()

  if (isConnected()) {
    const ethWalletInfo = {
      currencyName: 'ETH',
      fullWalletName: `Ethereum (${web3connect.getProviderTitle()})`,
      currencyInfo: user.ethData?.infoAboutCurrency,
    }
    const bscWalletInfo = {
      currencyName: 'BNB',
      fullWalletName: `BSC (${web3connect.getProviderTitle()})`,
      currencyInfo: user.bnbData?.infoAboutCurrency,
    }
    const maticWalletInfo = {
      currencyName: 'MATIC',
      fullWalletName: `MATIC (${web3connect.getProviderTitle()})`,
      currencyInfo: user.maticData?.infoAboutCurrency,
    }
    const arbitrumWalletInfo = {
      currencyName: 'ARBETH',
      fullWalletName: `ARBITRUM ETH (${web3connect.getProviderTitle()})`,
      currencyInfo: user.arbethData?.infoAboutCurrency,
    }
    const walletMap = new Map([
      [config.evmNetworks.ETH.networkVersion, ethWalletInfo],
      [config.evmNetworks.BNB.networkVersion, bscWalletInfo],
      [config.evmNetworks.MATIC.networkVersion, maticWalletInfo],
      [config.evmNetworks.ARBETH.networkVersion, arbitrumWalletInfo],
    ])

    const hexChainId = web3connect.getChainId()
    const networkVersion = Number(Number(hexChainId).toString(10))

    if (isAvailableNetwork()){
      const currencyName = walletMap.get(networkVersion)?.currencyName
      const fullWalletName = walletMap.get(networkVersion)?.fullWalletName
      const currencyInfo = walletMap.get(networkVersion)?.currencyInfo

      reducers.user.addWallet({
        name: 'metamaskData',
        data: {
          address: getAddress(),
          balance: 0,
          balanceError: false,
          isConnected: true,
          isMetamask: true,
          currency: currencyName,
          fullName: fullWalletName,
          infoAboutCurrency: currencyInfo,
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

if (web3connect.hasCachedProvider()) {
  web3connectInit()
} else {
  addMetamaskWallet()
}

const handleDisconnectWallet = (callback?) => {
  if (isConnected()) {
    disconnect().then(async () => {
      await actions.user.sign()
      await actions.user.getBalances()

      if (callback) callback()
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
      if (callback) callback(true)
    } else {
      if (callback) callback(false)
    }
  })
}

const switchNetwork = async (nativeCurrency) => {
  const { chainId, chainName, rpcUrls, blockExplorerUrls } = config.evmNetworks[nativeCurrency]

  if (!window.ethereum) return false

  try {
    const result = await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    })

    // null is a successful result
    return result === null
  } catch (switchError) {
    // network hasn't been added to MetaMask
    if (switchError.code === 4902) {
      try {
        return await addCurrencyNetwork(nativeCurrency)
      } catch (addError) {
        console.group('%c add a new Metamask network', 'color: red;')
        console.log(addError)
        console.groupEnd()
      }
    } else {
      console.group('%c switch the Metamask network', 'color: red;')
      console.log(switchError)
      console.groupEnd()
    }
  }
}

const addCurrencyNetwork = async (currency) => {
  if(!(isConnected())) {
    return false
  }

  const { coin, blockchain } = getCoinInfo(currency)
  const nativeCurrency = blockchain ? blockchain : coin.toUpperCase()

  const {
    chainId,
    chainName,
    rpcUrls,
    blockExplorerUrls
  } = config.evmNetworks[nativeCurrency]

  const {
    name,
    symbol,
    precision: decimals
  } = COIN_DATA[nativeCurrency]

  const params = {
    chainId: `0x${chainId.toString(16)}`,
    chainName,
    nativeCurrency: {
      name,
      symbol, // 2-6 characters long
      decimals,
    },
    rpcUrls,
    blockExplorerUrls
  }

  const web3 = web3connect.getWeb3()
  const ethereum = window.ethereum

  if (web3.eth  && ethereum) {
    return new Promise((res, rej) => {
      web3.eth.getAccounts((error, accounts) => {
        ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [params, accounts[0]],
        })
        .then((result) => {
          console.log('Success add and switch to network')
          res(true)
        })
        .catch((error) => {
          rej(new Error(`Metamask > addCurrencyNetwork error: ${error.message}`))
        })
      })
    })
  } else {
    throw new Error('Can not access to web3 or ethereum')
  }
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

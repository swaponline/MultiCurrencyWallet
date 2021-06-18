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
import { AVAILABLE_NETWORKS_BY_COIN, AVAILABLE_NETWORKS, EVM_NETWORKS } from 'common/helpers/constants/AVAILABLE_EVM_NETWORKS'

const NETWORK = process.env.MAINNET
  ? 'MAINNET'
  : 'TESTNET'

const NETWORK_NUMBER = NETWORK === 'MAINNET'
  ? 0 : 1 // 0 - MAINNET, 1 - TESTNET

// Binance Smart Chain: 56 = Mainnet, 97 = Testnet
// Ethereum: 1 = Mainnet, 3 = Ropsten
const web3connect = new Web3Connect({
  web3ChainId: process.env.MAINNET ? 1 : 3,
  web3RPC: config.web3.provider,
})

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

const isConnected = () => web3connect.isConnected()

const getAddress = () => (isConnected()) ? web3connect.getAddress() : ``

const getWeb3 = () => (isConnected()) ? web3connect.getWeb3() : false

const _init = async () => {
  await web3connect.onInit(() => {
    if (web3connect.hasCachedProvider()) {
      let _web3 = false
      try {
        //@ts-ignore: strictNullChecks
        _web3 = web3connect.getWeb3()
      } catch (err) {
        web3connect.clearCache()
        addMetamaskWallet()
        return
      }
      setMetamask(_web3)
      addMetamaskWallet()
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
  console.log('metamask getBalance')
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

const isAvailableNetwork = () => {
    const hexChainId = web3connect.getChainId()
    const chainId = Number(Number(hexChainId).toString(10))

    return (AVAILABLE_NETWORKS[NETWORK_NUMBER].includes(chainId))
}

const isAvailableNetworkByCurrency = (currency) => {
  const { coin, blockchain } = getCoinInfo(currency)
  const ticker = coin.toUpperCase()

  const isUTXOModel = COIN_DATA[ticker]?.model === COIN_MODEL.UTXO

  if (isUTXOModel) return false

  const currencyNetworkVersions =
    (blockchain)
    ? AVAILABLE_NETWORKS_BY_COIN[blockchain]
    : AVAILABLE_NETWORKS_BY_COIN[ticker]

  const currencyNetworkVersion = currencyNetworkVersions[NETWORK_NUMBER]

  const hexChainId = web3connect.getChainId()
  const currentNetworkVersions = Number(Number(hexChainId).toString(10))

  return currencyNetworkVersion === currentNetworkVersions
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
    const walletMap = new Map([
      [AVAILABLE_NETWORKS_BY_COIN.ETH[NETWORK === 'MAINNET' ? 0 : 1], ethWalletInfo],
      [AVAILABLE_NETWORKS_BY_COIN.BNB[NETWORK === 'MAINNET' ? 0 : 1], bscWalletInfo],
      [AVAILABLE_NETWORKS_BY_COIN.MATIC[NETWORK === 'MAINNET' ? 0 : 1], maticWalletInfo],
    ])

    const hexChainId = web3connect.getChainId()
    const chainId = Number(Number(hexChainId).toString(10))

    if (isAvailableNetwork()){
      const currencyName = walletMap.get(chainId)?.currencyName
      const fullWalletName = walletMap.get(chainId)?.fullWalletName
      const currencyInfo = walletMap.get(chainId)?.currencyInfo

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
          isMnemonic: true,
          unconfirmedBalance: 0,
          networkVersion: chainId,
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
          isMnemonic: true,
          unconfirmedBalance: 0,
          networkVersion: chainId,
          unknownNetwork: true,
        },
      })
    }
  } else {
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
        isMnemonic: true,
        unconfirmedBalance: 0,
      },
    })
  }
}

if (web3connect.hasCachedProvider()) {
  _init()
} else {
  addMetamaskWallet()
}


const handleDisconnectWallet = (cbDisconnected?) => {
  if (isEnabled()) {
    disconnect().then(async () => {
      await actions.user.sign()
      await actions.user.getBalances()
      if (cbDisconnected) cbDisconnected()
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

const addCurrencyNetwork = (currency) => {
  if(!(isConnected())) {
    return
  }

  const { coin, blockchain } = getCoinInfo(currency)
  const nativeCurrency = blockchain ? blockchain : coin.toUpperCase()

  const {
    chainId,
    chainName,
    rpcUrls,
    blockExplorerUrls
  } = EVM_NETWORKS[nativeCurrency][NETWORK_NUMBER]

  const {
    name,
    symbol,
    precision: decimals
  } = COIN_DATA[nativeCurrency]

  const params = {
    chainId, // A 0x-prefixed hexadecimal string
    chainName,
    nativeCurrency: {
      name,
      symbol, // 2-6 characters long
      decimals,
    },
    rpcUrls,
    blockExplorerUrls
  }

  //@ts-ignore: strictNullChecks
  web3connect.getWeb3().eth.getAccounts((error, accounts) => {
    //@ts-ignore: strictNullChecks
    window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [params, accounts[0]],
    })
    .then((result) => {
      console.log(result)
    })
    .catch((error) => {
      console.log(error)
    });
  })
}

const metamaskApi = {
  connect,
  isEnabled,
  isConnected,
  getAddress,
  web3connect,
  addWallet,
  getBalance,
  getWeb3,
  disconnect,
  isCorrectNetwork,
  isAvailableNetwork,
  isAvailableNetworkByCurrency,
  handleDisconnectWallet,
  handleConnectMetamask,
  addCurrencyNetwork
}

window.metamaskApi = metamaskApi

export default metamaskApi

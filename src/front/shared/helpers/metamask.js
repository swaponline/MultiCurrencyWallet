import reducers from 'redux/core/reducers'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import { cacheStorageGet, cacheStorageSet, constants } from 'helpers'
import web3 from 'helpers/web3'
import { setMetamask, setDefaultProvider } from 'helpers/web3'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3 from 'web3'
import Web3Modal from 'web3modal'

import Web3Connect from '../web3connect'

console.log('In metamask', Web3Connect)

window.webconnect = new Web3Connect()

const providerOptions = {
  /*
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: '5ffc47f65c4042ce847ef66a3fa70d4c',
    },
  },
  */
}

const web3Modal = new Web3Modal({
  network: (process.env.MAINNET) ? 'mainnet' : 'rinkeby',
  cacheProvider: true,
  providerOptions
})

let _connected = false
let _currentChain = 0
let _currentAddress = ``
let _isInited = false
let _web3 = null
let _provider = null


const metamaskProvider = (window.ethereum) || false

const isEnabled = () => true

const isConnected = () => _connected

const getAddress = () => (isConnected()) ? _currentAddress : ``

const _cacheAddress = async () => {
  _currentAddress = ``

  // like WalletConnect
  if (_provider
    && _provider.accounts
    && _provider.accounts.length
  ) {
    _currentAddress = _provider.accounts[0]
    return
  }
  const accounts = await _web3.eth.getAccounts()
  if (accounts.length) _currentAddress = accounts[0]
}

const _init = async () => {
  if (web3Modal.cachedProvider) {
    try {
      _web3 = await getWeb3()
      _connected = true
    } catch (err) {
      console.log('fail get web3', err)
      web3Modal.clearCachedProvider()
      _connected = false
      _initReduxState()
      return
    }
    setMetamask(_web3)
    await _cacheAddress()
    _initReduxState()
  }
}

const addWallet = () => {
  _initReduxState()
  if (isConnected()) {
    getBalance()
  }
}



const getWeb3 = async () => {
  _provider = await web3Modal.connect()
  const web3 = new Web3(_provider)
  web3.isMetamask = true
  return web3
}

const getBalance = () => {
  const { user: { metamaskData } } = getState()
  if (metamaskData) {
    const { address } = metamaskData

    const balanceInCache = cacheStorageGet('currencyBalances', `eth_${address}`)
    if (balanceInCache !== false) {
      reducers.user.setBalance({
        name: 'metamaskData',
        amount: balanceInCache,
      })
      return balanceInCache
    }

    return _web3.eth.getBalance(address)
      .then(result => {
        const amount = _web3.utils.fromWei(result)

        cacheStorageSet('currencyBalances', `eth_${address}`, amount, 30)
        reducers.user.setBalance({ name: 'metamaskData', amount })
        return amount
      })
      .catch((e) => {
        reducers.user.setBalanceError({ name: 'metamaskData' })
      })
  }
}

const disconnect = () => new Promise(async (resolved, reject) => {
  if (isConnected()) {
    if (_provider
      && _provider.close
      && typeof _provider.close === `function`
    ) {
      // Like Connect-Wallet
      _provider.close()
    }
    await web3Modal.clearCachedProvider()

    resolved(true)
    window.location.reload()
  } else {
    resolved(true)
  }
})

const connect = () => new Promise((resolved, reject) => {
  web3Modal
    .connect()
    .then((provider) => {
      if (provider) {
        localStorage.setItem(constants.localStorage.isWalletCreate, true)

        window.location.reload()
      } else {
        setDefaultProvider()
        resolved(false)
      }
    })
    .catch((e) => {
      setDefaultProvider()
      resolved(false)
    })
})

/* metamask wallet layer */


const isMainnet = () => _currentChain === `0x1`
const isTestnet = () => _currentChain === `0x4`

const isCorrectNetwork = () => {
  if (!metamaskProvider) {
    // If not installed metamask - used other wallet (connect-wallet, etc)
    // Think - network is correct
    return true
  }
  return (process.env.MAINNET) ? isMainnet() : isTestnet()
}

if (metamaskProvider) {
  if (!isConnected()) {
    if (metamaskProvider.isConnected()) {
      console.warn(`Metamask exists and connected, but not connected in web3modal`)
    }
  }

  _currentChain = metamaskProvider.chainId
  metamaskProvider.on('chainChanged', (newChainId) => {
    if (newChainId !== _currentChain) {
      if (!metamaskProvider.autoRefreshOnNetworkChange) {
        window.location.reload()
      }
    }
  })
  metamaskProvider.on('accountsChanged', (newAccounts) => {
    if (newAccounts.length === 0) {
      // user disconnect metamask
      if (_currentAddress) {
        web3Modal.clearCachedProvider()
        window.location.reload()
        return
      }
    }
    if ((!newAccounts.length
      || newAccounts[0] !== _currentAddress
      ) && _currentAddress
    ) {
      window.location.reload()
    }
  })
}
/* --------------------- */

const _initReduxState = () => {
  const {
    user: {
      ethData,
    },
  } = getState()

  if (isConnected()) {
    reducers.user.addWallet({
      name: 'metamaskData',
      data: {
        address: getAddress(),
        balance: 0,
        balanceError: false,
        isConnected: true,
        isMetamask: true,
        currency: "ETH",
        fullName: "Ethereum (Metamask)",
        infoAboutCurrency: ethData.infoAboutCurrency,
        isBalanceFetched: true,
        isMnemonic: true,
        unconfirmedBalance: 0,
      },
    })
  } else {
    reducers.user.addWallet({
      name: 'metamaskData',
      data: {
        address: 'Not connected',
        balance: 0,
        balanceError: false,
        isConnected: false,
        isMetamask: true,
        currency: "ETH",
        fullName: (metamaskProvider) ? `Ethereum (Metamask)` : `Ethereum (Connect-Wallet)`,
        infoAboutCurrency: ethData.infoAboutCurrency,
        isBalanceFetched: true,
        isMnemonic: true,
        unconfirmedBalance: 0,
      }
    })
  }
}

if (web3Modal.cachedProvider) {
  _init()
} else {
  _initReduxState()
}

const metamaskApi = {
  connect,
  isEnabled,
  isConnected,
  getAddress,
  metamaskProvider,
  addWallet,
  getBalance,
  getWeb3,
  web3Modal,
  disconnect,
  isCorrectNetwork,
}


window.metamaskApi = metamaskApi

export default metamaskApi

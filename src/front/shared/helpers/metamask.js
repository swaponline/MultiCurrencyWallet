import reducers from 'redux/core/reducers'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import { cacheStorageGet, cacheStorageSet } from 'helpers'
import web3 from 'helpers/web3'
import { setMetamask, setDefaultProvider } from 'helpers/web3'


import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3 from 'web3'
import Web3Modal from 'web3modal'

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: '5ffc47f65c4042ce847ef66a3fa70d4c',
    },
  },
}

const web3Modal = new Web3Modal({
  network: (process.env.MAINNET) ? 'mainnet' : 'rinkeby',
  cacheProvider: true,
  providerOptions
})

let _currentChain = 0
let _currentAddress = ``
let _isInited = false
let _web3 = null

const metamaskProvider = (window.ethereum) || false

const isEnabled = () => true

const isConnected = () => web3Modal.cachedProvider

const getAddress = () => (isConnected()) ? _currentAddress : ``

const _cacheAddress = async () => {
  _currentAddress = ``
  const accounts = await _web3.eth.getAccounts()
  if (accounts.length) _currentAddress = accounts[0]
}

const _checkMetamaskUserDisconnect = () => {
  if (metamaskProvider
    && (
      !metamaskProvider.isConnected()
      || !metamaskProvider.selectedAddress
    )
  ) {
    // Metamask exists - but disconnected
    web3Modal.clearCachedProvider()
  }
}

const _init = async () => {
  if (isConnected()) {
    try {
      _web3 = await getWeb3()
    } catch (err) {
      web3Modal.clearCachedProvider()
      console.log('fail init web3 - reload')
      //window.location.reload()
    }
    setMetamask(web3)
    await _cacheAddress()
    _initReduxState()
    _isInited = true
  }
}

const addWallet = () => {
  _initReduxState()
  if (isEnabled() && isConnected()) {
    getBalance()
  }
}


const getWeb3 = async () => {
  const provider = await web3Modal.connect();
  const web3 = new Web3(provider)
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

    return web3.eth.getBalance(address)
      .then(result => {
        const amount = web3.utils.fromWei(result)

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
  if (isEnabled() && isConnected()) {
    web3Modal.clearCachedProvider()
    resolved(true)
    console.log('disconnect - reload')
    //window.location.reload()
  } else {
    resolved(true)
  }
})

const connect = () => new Promise((resolved, reject) => {
  web3Modal
    .connect()
    .then((provider) => {
      if (isConnected()) {
        console.log('reload on conneted')
        // window.location.reload()
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
  switch (process.env.NETWORK) {
    case `testnet`: return isTestnet()
    case `mainnet`: return isMainnet()
  }
}

if (metamaskProvider) {
  console.log('metamask exist')
  if (!isConnected()) {
    console.log('not connected - web3modal')
    if (metamaskProvider.isConnected()) {
      console.log('but connected in metamask')
    }
  } else {
    console.log('not injected')
    if (metamaskProvider.isConnected()) {
      console.log('not injected - but connected')
      console.log('set metamask in web3modal')
      web3Modal.setCachedProvider(`injected`)
    }
  }
  
  _currentChain = metamaskProvider.chainId
  metamaskProvider.on('chainChanged', (newChainId) => {
    if (newChainId !== _currentChain) {
      if (!metamaskProvider.autoRefreshOnNetworkChange) {
        console.log('Chain changed - restart')
        //window.location.reload()
      }
    }
  })
  metamaskProvider.on('accountsChanged', (newAccounts) => {
    if ((!newAccounts.length
      || newAccounts[0] !== _currentAddress
      ) && _currentAddress
    ) {
      console.log('Account changed - restart')
      //window.location.reload()
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

  if (isEnabled() && isConnected()) {
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
    if (isEnabled()) {
      reducers.user.addWallet({
        name: 'metamaskData',
        data: {
          address: 'Not connected',
          balance: 0,
          balanceError: false,
          isConnected: false,
          isMetamask: true,
          currency: "ETH",
          fullName: "Ethereum (Metamask)",
          infoAboutCurrency: ethData.infoAboutCurrency,
          isBalanceFetched: true,
          isMnemonic: true,
          unconfirmedBalance: 0,
        }
      })
    } else {
      reducers.user.addWallet({
        name: 'metamaskData',
        data: false,
      })
    }
  }
}

// check - if user disconnect wallet from metamask - clear provider
_checkMetamaskUserDisconnect()

if (isConnected()) {
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

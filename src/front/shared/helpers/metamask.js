import reducers from 'redux/core/reducers'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import { cacheStorageGet, cacheStorageSet, constants } from 'helpers'
import web3 from 'helpers/web3'
import config from 'app-config'
import { setMetamask, setDefaultProvider } from 'helpers/web3'


import Web3Connect from '../../../common/web3connect'

console.log('In metamask', Web3Connect)

console.log(config.web3.provider)
const web3connect = new Web3Connect({
  web3ChainId: (process.env.MAINNET) ? 1 : 4,
  web3RPC: config.web3.provider,
})

web3connect.on('connected', () => {
  localStorage.setItem(constants.localStorage.isWalletCreate, true)
  actions.core.markCoinAsVisible(`ETH`)
  window.location.reload()
})
web3connect.on('disconnect', () => window.location.reload())
web3connect.on('accountChange', () => window.location.reload())
web3connect.on('chainChanged', () => window.location.reload())

const isEnabled = () => true

const isConnected = () => web3connect.isConnected()

const getAddress = () => (isConnected()) ? web3connect.getAddress() : ``

const getWeb3 = () => (isConnected()) ? web3connect.getWeb3() : false

const _init = async () => {
  web3connect.onInit(() => {
    if (web3connect.hasCachedProvider()) {
      let _web3 = false
      try {
        _web3 = web3connect.getWeb3()
      } catch (err) {
        web3connect.clearCache()
        _initReduxState()
        return
      }
      setMetamask(_web3)
      _initReduxState()
    } else {
      _initReduxState()
    }
  })
}

const addWallet = () => {
  _initReduxState()
  if (isConnected()) {
    getBalance()
  }
}

const getBalance = () => {
  console.log('metamask getBalance')
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

    return web3connect.getWeb3().eth.getBalance(address)
      .then(result => {
        const amount = web3connect.getWeb3().utils.fromWei(result)

        cacheStorageSet('currencyBalances', `eth_${address}`, amount, 30)
        reducers.user.setBalance({ name: 'metamaskData', amount })
        return amount
      })
      .catch((e) => {
        console.log('fail get balance')
        console.log('error', e)
        reducers.user.setBalanceError({ name: 'metamaskData' })
      })
  }
}

const disconnect = () => new Promise(async (resolved, reject) => {
  if (isConnected()) {
    await web3connect.Disconnect()
    resolved(true)
    // window.location.reload()
  } else {
    resolved(true)
  }
})

const connect = () => new Promise(async (resolved, reject) => {
  actions.modals.open(constants.modals.ConnectWalletModal)
})

/* metamask wallet layer */
const isCorrectNetwork = () => web3connect.isCorrectNetwork()


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
        fullName: `Ethereum (${web3connect.getProviderTitle()})`,
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
        fullName: `Ethereum (Web3 provider)`,
        infoAboutCurrency: ethData.infoAboutCurrency,
        isBalanceFetched: true,
        isMnemonic: true,
        unconfirmedBalance: 0,
      }
    })
  }
}

if (web3connect.hasCachedProvider()) {
  _init()
} else {
  _initReduxState()
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
}


window.metamaskApi = metamaskApi

export default metamaskApi

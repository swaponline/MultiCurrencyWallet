import { EventEmitter } from 'events'
import { ConnectorEvent } from '@web3-react/types'
import Web3 from 'web3'
import SUPPORTED_PROVIDERS from './providers/supported'
import getProviderByName from './providers'
import { isInjectedEnabled } from './providers'
import { isMobile } from 'react-device-detect'
import detectEthereumProvider from '@metamask/detect-provider'


export default class Web3Connect extends EventEmitter {
  _cachedProvider = null
  _cachedChainId = null
  _cachedAddress = null
  _cachedWeb3 = null
  _isConnected = false

  _isDAppBrowser = false

  _web3RPC = null
  _web3ChainId = null

  _inited = false

  constructor(options) {
    super()
    const {
      web3RPC,
      web3ChainId,
    } = options

    this._web3RPC = web3RPC
    this._web3ChainId = web3ChainId

    if (this._checkIsDAppBrowser()) {
      console.log('Is dAppBrowser')
      this._inited = true
      return
    }
    // Предыдущий провайдер (после перезагрузки восстанавливаем его)
    const cachedProviderName = localStorage.getItem(`WEB3CONNECT:PROVIDER`)
    if (cachedProviderName) {
      const lsProvider = getProviderByName(this, cachedProviderName)
      if (lsProvider) {
        lsProvider.isConnected().then(async (isConnected) => {
          if (isConnected) {
            if (await lsProvider.Connect()) {
              this._cachedProvider = lsProvider
              this._setupEvents()
              await this._cacheProviderData()
              this._isConnected = true
              this._inited = true
              return
            }
          }
          this.clearCache()
          this._inited = true
        })
      } else {
        this.clearCache()
        this._inited = true
      }
    } else {
      this._inited = true
    }
  }

  _checkIsDAppBrowser() {
    alert('checkIsDApp')
    if (isMobile || true) {
      if (window.ethereum) {
        alert('exists ethereum')
      }

      window.addEventListener('ethereum#initialized', () => {
        alert('metamask exists and inited')
      }, {
        once: true,
      });
      if (window
        && window.ethereum
      ) {
        alert('window.ethereum exists')
        if (window.ethereum.isMetaMask) {
          alert('has metamask')
        }
        return false
        this._isDAppBrowser = true
        this._cachedProvider = window.ethereum
        this._cachedAddress = window.ethereum.address
        this._cachedChainId = window.ethereum.chainId
        this._cachedWeb3 = new Web3(window.ethereum)
        this._isConnected = true
        return true

      } else {
        alert('no ethereum')
        detectEthereumProvider().then((provider) => {
          if (provider) {
            // From now on, this should always be true:
            // provider === window.ethereum
            alert('exists metamask provider')
            if (window.ethereum) {
              alert('also exist window.ethereum')
            } else {
              alert('but no window.ethereum')
            }
          } else {
            alert('Please install MetaMask!')
          }
        })
      }
    }
    return false
  }

  isInjectedEnabled() {
    if (isMobile) return false

    return isInjectedEnabled()
  }

  getLibrary(provider) {
    const library = new Web3Provider(provider)
    library.pollingInterval = 12000
    return library
  }

  onInit(cb) {
    const waitInit = () => {
      if (this._inited) {
        cb()
      } else {
        setTimeout( waitInit, 100 )
      }
    }
    waitInit()
  }

  hasCachedProvider() {
    const cachedProviderName = localStorage.getItem(`WEB3CONNECT:PROVIDER`)
    if (cachedProviderName) {
      const lsProvider = getProviderByName(this, cachedProviderName)
      if (lsProvider) return true
    }
    return false
  }

  clearCache() {
    localStorage.removeItem(`WEB3CONNECT:PROVIDER`)
    this._cachedProvider = null
    this._cachedChainId = null
    this._cachedAddress = null
    this._cachedWeb3 = null
  }

  _setupEvents() {
    if (this._cachedProvider) {
      this._cachedProvider.on(ConnectorEvent.Update, (data) => {
        if (data
          && data.account
          && data.account != this._cachedAddress
        ) {
          this._cachedAddress = data.account
          this.emit('accountChange')
        }
        if (data
          && data.chainId
          && data.chainId !== this._cachedChainId
        ) {
          this._cachedChainId = data.chainId
          this.emit('chainChanged')
        }
      })
      this._cachedProvider.on(ConnectorEvent.Deactivate, () => {
        this.clearCache()
        this.emit('disconnect')
      })
    }
  }

  async _cacheProviderData() {
    this._cachedAddress = await this._cachedProvider.getAccount()
    this._cachedChainId = await this._cachedProvider.getChainId()
    const _web3provider = await this._cachedProvider.getProvider()
    await _web3provider.enable()

    // @ToDo - Hard fix walletconnect
    // https://github.com/WalletConnect/walletconnect-monorepo/issues/384
    if (window) {
      window.send = (e,t) => {
        return _web3provider.send(e,t)
      }
    }

    this._cachedWeb3 = new Web3(
      _web3provider
    )
    this._cachedWeb3.isMetamask = true
  }

  async connectTo(provider) {
    if (SUPPORTED_PROVIDERS[provider]) {
      const _connector = getProviderByName(this, provider, true)
      if (_connector) {
        if (await _connector.Connect()) {
          localStorage.setItem(`WEB3CONNECT:PROVIDER`, provider)
          this._cachedProvider = _connector
          this._setupEvents()
          await this._cacheProviderData()
          this._isConnected = true
          setTimeout( () => { this.emit('connected') } , 100)
          return true
        }
      }
      return false
    } else {
      throw new Error(`Not supported provider ${provider}`)
    }
  }

  getProviders = () => {
    const providers = Object.keys(SUPPORTED_PROVIDERS).map((key) => SUPPORTED_PROVIDERS[key])
    return (isInjectedEnabled())
      ? providers
      : providers.filter((name) => name !== SUPPORTED_PROVIDERS.INJECTED)
  }

  isConnected() {
    return (this._cachedProvider) ? true : false
  }

  isCorrectNetwork() {
    // @ToDo - test Metamask dAppBrowser
    return true
    return (
      `${this._web3ChainId}` === `${this._cachedChainId}`
      || `0x0${this._web3ChainId}` === `${this._cachedChainId}`
    )
  }

  getWeb3() {
    if (this._cachedProvider) {
      return this._cachedWeb3
    }
  }

  getAddress() {
    if (this._cachedProvider) {
      return this._cachedAddress
    }
  }

  async Disconnect() {
    if (this._cachedProvider && !this._isDAppBrowser) {
      this._isConnected = false
      await this._cachedProvider.Disconnect()
      this.clearCache()
      this.emit('disconnect')
    }
  }
}
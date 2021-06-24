import { EventEmitter } from 'events'
import { ConnectorEvent } from '@web3-react/types'
import Web3 from 'web3'
import SUPPORTED_PROVIDERS from './providers/supported'
import INJECTED_TYPE from './providers/InjectedType'
import getProviderByName from './providers'
import { isInjectedEnabled } from './providers'
import { isMobile } from 'react-device-detect'
import config from 'app-config'

export default class Web3Connect extends EventEmitter {
  _cachedProvider = null
  _cachedProviderName = null
  _cachedChainId = null
  _cachedAddress = null
  _cachedWeb3 = null
  _isConnected = false

  _isDAppBrowser = false

  _web3RPC = null
  _web3ChainId = null

  _inited = false
  _walletLocked = false

  constructor(options) {
    super()
    const {
      web3RPC,
      web3ChainId,
    } = options

    this._web3RPC = web3RPC
    this._web3ChainId = web3ChainId

    this._checkIsDAppBrowser()

    // Предыдущий провайдер (после перезагрузки восстанавливаем его)
    const cachedProviderName = localStorage.getItem(`WEB3CONNECT:PROVIDER`)
    if (cachedProviderName) {
      //@ts-ignore
      const lsProvider = getProviderByName(this, cachedProviderName)
      if (lsProvider) {
        lsProvider.isConnected().then(async (isConnected) => {
          if (isConnected) {
            if (await lsProvider.Connect()) {
              //@ts-ignore: strictNullChecks
              this._cachedProviderName = cachedProviderName
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

  isLocked() {
    return this._walletLocked
  }

  getProviderTitle() {
    switch (this._cachedProviderName) {
      //@ts-ignore: strictNullChecks
      case SUPPORTED_PROVIDERS.WALLETCONNECT:
        return 'Wallet Connect'
      //@ts-ignore: strictNullChecks
      case SUPPORTED_PROVIDERS.INJECTED:
        return this.getInjectedTitle()
      default:
        return `Web3 provider`
    }
  }

  getInjectedTitle() {
    switch (this.getInjectedType()) {
      case INJECTED_TYPE.NONE: return 'Not installed'
      case INJECTED_TYPE.UNKNOWN: return 'Injected Web3'
      case INJECTED_TYPE.OPERA: return 'Opera Crypto Wallet'
      case INJECTED_TYPE.METAMASK: return 'MetaMask'
      case INJECTED_TYPE.TRUST: return 'Trust Wallet'
      case INJECTED_TYPE.LIQUALITY: return 'Liquality Wallet'
    }
  }

  getProviderType() {
     switch (this._cachedProviderName) {
      //@ts-ignore: strictNullChecks
      case SUPPORTED_PROVIDERS.WALLETCONNECT:
        return SUPPORTED_PROVIDERS.WALLETCONNECT
      //@ts-ignore: strictNullChecks
      case SUPPORTED_PROVIDERS.INJECTED:
        return this.getInjectedType()
      default:
        return `NONE`
    }
  }

  getInjectedType() {
    if (window && window.ethereum) {
      if (window.ethereum.isLiquality) return INJECTED_TYPE.LIQUALITY
      if (window.ethereum.isTrust) return INJECTED_TYPE.TRUST
      if (window.ethereum.isMetaMask) return INJECTED_TYPE.METAMASK
      if ((!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) return INJECTED_TYPE.OPERA

      return INJECTED_TYPE.UNKNOWN
    } else {
      return INJECTED_TYPE.NONE
    }
  }

  _checkIsDAppBrowser() {
    if (isMobile) {

      if (window
        && window.ethereum
      ) {
        this._isDAppBrowser = true
      }
    }
  }

  isInjectedEnabled() {
    return isInjectedEnabled()
  }

  async onInit(cb) {
    const waitInit = async () => {
      if (this._inited) {
        cb()
      } else {
        await setTimeout( waitInit, 100 )
      }
    }
     await waitInit()
  }

  hasCachedProvider() {
    const cachedProviderName = localStorage.getItem(`WEB3CONNECT:PROVIDER`)
    if (cachedProviderName) {
      //@ts-ignore
      const lsProvider = getProviderByName(this, cachedProviderName)
      if (lsProvider) return true
    }
    return false
  }

  clearCache() {
    localStorage.removeItem(`WEB3CONNECT:PROVIDER`)
    this._cachedProviderName = null
    this._cachedProvider = null
    this._cachedChainId = null
    this._cachedAddress = null
    this._cachedWeb3 = null
  }

  _setupEvents() {
    if (this._cachedProvider) {
      //@ts-ignore: strictNullChecks
      this._cachedProvider.on(ConnectorEvent.Update, (data) => {
        if (data
          && data.account
          && data.account != this._cachedAddress
        ) {
          this._cachedAddress = data.account
          this.emit('accountChange')
          this.emit('updated')
        }
        if (data
          && data.chainId
          && data.chainId !== this._cachedChainId
        ) {
          this._cachedChainId = data.chainId
          this.emit('chainChanged')
          this.emit('updated')
        }
      })
      //@ts-ignore: strictNullChecks
      this._cachedProvider.on(ConnectorEvent.Deactivate, () => {
        this.clearCache()
        this.emit('disconnect')
        this.emit('updated')
      })
    }
  }

  async _cacheProviderData() {
    //@ts-ignore: strictNullChecks
    this._cachedAddress = await this._cachedProvider.getAccount()
    //@ts-ignore: strictNullChecks
    this._cachedChainId = await this._cachedProvider.getChainId()
    //@ts-ignore: strictNullChecks
    const _web3provider = await this._cachedProvider.getProvider()
    await _web3provider.enable()

    // @ToDo - Hard fix walletconnect
    // https://github.com/WalletConnect/walletconnect-monorepo/issues/384
    if (window) {
      window.send = (e,t) => {
        return _web3provider.send(e,t)
      }
    }

    //@ts-ignore: strictNullChecks
    this._cachedWeb3 = new Web3(
      _web3provider
    )
    //@ts-ignore: strictNullChecks
    this._cachedWeb3.isMetamask = true
  }

  async connectTo(provider) {
    this._walletLocked = false
    if (SUPPORTED_PROVIDERS[provider]) {
      const _connector = getProviderByName(this, provider, true)
      if (_connector) {
        if (await _connector.Connect()) {
          localStorage.setItem(`WEB3CONNECT:PROVIDER`, provider)
          this._cachedProviderName = provider
          this._cachedProvider = _connector
          this._setupEvents()
          await this._cacheProviderData()
          this._isConnected = true
          this.emit('connected')
          this.emit('updated')
          return true
        } else {
          if (_connector.isLocked()) {
            this._walletLocked = true
          }
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

  getChainId = () => {
    return this._cachedChainId
  }

  isConnected() {
    return (this._cachedProvider) ? true : false
  }

  isCorrectNetwork() {
    // @ToDo - test Metamask dAppBrowser
    const nonExistent = -42 // random (fix ts error)

    return (
      `${this._web3ChainId}` === `${this._cachedChainId}`
      //@ts-ignore: strictNullChecks
      || this._web3ChainId === Number.parseInt(this._cachedChainId)
      || `0x0${this._web3ChainId}` === `${this._cachedChainId}`
      || `0x${this._web3ChainId}` === `${this._cachedChainId}` // Opera Mobile
      || config.evmNetworkVersions.includes(this._web3ChainId || nonExistent)
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
    if (this._cachedProvider) {
      this._isConnected = false
      //@ts-ignore: strictNullChecks
      await this._cachedProvider.Disconnect()
      this.clearCache()
      this.emit('disconnect')
      this.emit('updated')
    }
  }
}

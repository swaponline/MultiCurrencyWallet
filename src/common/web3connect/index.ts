/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { EventEmitter } from 'events'
import { ConnectorEvent } from '@web3-react/types'
import { BigNumber } from 'bignumber.js'
import Web3 from 'web3'
import { isMobile } from 'react-device-detect'
import config from 'app-config'
import SUPPORTED_PROVIDERS from './providers/supported'
import INJECTED_TYPE from './providers/InjectedType'
import getProviderByName, { isInjectedEnabled } from './providers'

export default class Web3Connect extends EventEmitter {
  _cachedProvider: EthereumProvider | null = null

  _cachedWeb3: EthereumProvider | null = null

  _cachedProviderName: string | null = null

  _cachedChainId: number | null = null

  _cachedAddress = null

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
      getProviderByName(this, cachedProviderName).then((lsProvider) => {

        if (lsProvider) {
          lsProvider.isConnected().then(async (isConnected) => {
            if (isConnected) {
              if (await lsProvider.Connect()) {
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
      })
    } else {
      this._inited = true
    }
  }

  isLocked() {
    return this._walletLocked
  }

  getProviderTitle() {
    switch (this._cachedProviderName) {
      case SUPPORTED_PROVIDERS.WALLETCONNECT:
        return 'Wallet Connect'
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
      default: return 'Not installed'
    }
  }

  getProviderType() {
    switch (this._cachedProviderName) {
      case SUPPORTED_PROVIDERS.WALLETCONNECT:
        return SUPPORTED_PROVIDERS.WALLETCONNECT
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
    }
    return INJECTED_TYPE.NONE

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
        await setTimeout(waitInit, 100)
      }
    }
    await waitInit()
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
    this._cachedProviderName = null
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
          && data.account !== this._cachedAddress
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

      this._cachedProvider.on(ConnectorEvent.Deactivate, () => {
        this.clearCache()
        this.emit('disconnect')
        this.emit('updated')
      })
    }
  }

  async _cacheProviderData() {
    if (this._cachedProvider) {
      this._cachedAddress = await this._cachedProvider.getAccount()
      this._cachedChainId = await this._cachedProvider.getChainId()
      const _web3provider = await this._cachedProvider.getProvider()
      await _web3provider.enable()

      // @ToDo - Hard fix walletconnect
      // https://github.com/WalletConnect/walletconnect-monorepo/issues/384
      if (window) {
        window.send = (e, t) => _web3provider.send(e, t)
      }

      this._cachedWeb3 = new Web3(_web3provider)
      this._cachedWeb3.isMetamask = true
    }
  }

  async connectTo(provider) {
    this._walletLocked = false

    if (SUPPORTED_PROVIDERS[provider]) {
      const _connector = await getProviderByName(this, provider, true)

      if (_connector) {
        const connected = await _connector.Connect()
        if (connected) {
          localStorage.setItem(`WEB3CONNECT:PROVIDER`, provider)
          this._cachedProviderName = provider
          this._cachedProvider = _connector
          this._setupEvents()

          await this._cacheProviderData()

          this._isConnected = true
          this.emit('connected')
          this.emit('updated')
          return true
        }
        if (_connector.isLocked()) {
          this._walletLocked = true
        }

      }
      return false
    }
    throw new Error(`Not supported provider ${provider}`)

  }

  getProviders = () => {
    const providers = Object.keys(SUPPORTED_PROVIDERS).map((key) => SUPPORTED_PROVIDERS[key])
    return (isInjectedEnabled())
      ? providers
      : providers.filter((name) => name !== SUPPORTED_PROVIDERS.INJECTED)
  }

  getChainId = () => this._cachedChainId

  isConnected() {
    return !!(this._cachedProvider)
  }

  getNetworksId = () => {
    const decimalCurrrentId = this._web3ChainId ? Number(new BigNumber(this._web3ChainId).toString(10)) : undefined
    const dicimalCachedId = this._cachedChainId ? Number(new BigNumber(this._cachedChainId).toString(10)) : undefined

    return {
      decimalCurrrentId,
      dicimalCachedId,
    }
  }

  isCorrectNetwork() {
    const { decimalCurrrentId, dicimalCachedId } = this.getNetworksId()

    const supportedNetwork = config.evmNetworkVersions.includes(decimalCurrrentId)
      || config.evmNetworkVersions.includes(dicimalCachedId)

    return (
      `${this._web3ChainId}` === `${this._cachedChainId}`
      // @ts-ignore: strictNullChecks
      || this._web3ChainId === Number.parseInt(this._cachedChainId, 10)
      || `0x0${this._web3ChainId}` === `${this._cachedChainId}`
      || `0x${this._web3ChainId}` === `${this._cachedChainId}` // Opera Mobile
      || supportedNetwork
      || false
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

      await this._cachedProvider.Disconnect()
      this.clearCache()
      this.emit('disconnect')
      this.emit('updated')
    }
  }
}

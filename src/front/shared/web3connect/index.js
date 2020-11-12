import { EventEmitter } from 'events'
import { ConnectorEvent } from '@web3-react/types'
import SUPPORTED_PROVIDERS from './providers/supported'
import getProviderByName from './providers'
import { isInjectedEnabled } from './providers'


export default class Web3Connect extends EventEmitter {
  _cachedProvider = null
  _cachedChainId = null
  _cachedAddress = null

  _web3RPC = null
  _web3ChainId = null


  constructor(options) {
    super()
    const {
      web3RPC,
      web3ChainId,
    } = options

    this._web3RPC = web3RPC
    this._web3ChainId = web3ChainId

    // Предыдущий провайдер (после перезагрузки восстанавливаем его)
    const cachedProviderName = localStorage.getItem(`WEB3CONNECT:PROVIDER`)
    if (cachedProviderName) {
      const lsProvider = getProviderByName(this, cachedProviderName)
      if (lsProvider) {
        lsProvider.isConnected().then(async (isConnected) => {
          console.log('isConnected', isConnected)
          if (isConnected) {
            if (await lsProvider.Connect()) {
              this._cachedProvider = lsProvider
              this._setupEvents()
              this._cacheProviderData()
              return
            }
          }
          this._clearCache()
        })
      } else {
        this._clearCache()
      }
    }
  }

  _clearCache() {
    localStorage.removeItem(`WEB3CONNECT:PROVIDER`)
    this._cachedProvider = null
    this._cachedChainId = null
    this._cachedAddress = null
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
        this._clearCache()
        this.emit('disconnect')
      })
    }
  }

  async _cacheProviderData() {
    this._cachedAddress = await this._cachedProvider.getAccount()
    this._cachedChainId = await this._cachedProvider.getChainId()
  }

  async connectTo(provider) {
    if (SUPPORTED_PROVIDERS[provider]) {
      const _connector = getProviderByName(this, provider)
      if (_connector) {
        if (await _connector.Connect()) {
          localStorage.setItem(`WEB3CONNECT:PROVIDER`, provider)
          this._cachedProvider = _connector
          this._setupEvents()
          await this._cacheProviderData()
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

  async isConnected() {
    return (this._cachedProvider) ? true : false
  }

  isCorrectNetwork() {
    return ((process.env.MAINNET) ? 1 : 4) === this._cachedChainId
  }

  getWeb3() {
  }

  async getAddress() {
    if (this._cachedProvider) {
      if (this._cachedAddress) {
        return this._cachedAddress
      }
      return this._cachedProvider.getAccount()
    }
    return false
  }

  async Disconnect() {
    if (this._cachedProvider) {
      await this._cachedProvider.Disconnect()
      localStorage.removeItem(`WEB3CONNECT:PROVIDER`)
    }
  }
}
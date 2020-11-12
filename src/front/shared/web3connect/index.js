import { EventEmitter } from 'events'
import { ConnectorEvent } from '@web3-react/types'

import config from 'helpers/externalConfig'

import SUPPORTED_PROVIDERS from './providers/supported'
import getProviderByName from './providers'
import { isInjectedEnabled } from './providers'


export default class Web3Connect extends EventEmitter {
  _cachedProvider = null
  _cachedChainId = null
  _cachedAddress = null


  constructor() {
    super()
    console.log('create Web3Connect')
    // Предыдущий провайдер (после перезагрузки восстанавливаем его)
    const cachedProviderName = localStorage.getItem(`WEB3CONNECT:PROVIDER`)
    console.log('cachedProviderName', cachedProviderName)
    if (cachedProviderName) {
      const lsProvider = getProviderByName(this, cachedProviderName)
      console.log('geted', lsProvider)
      if (lsProvider) {
        lsProvider.isConnected().then((isConnected) => {
          console.log('isConnected', isConnected)
          if (isConnected) {
            this._cachedProvider = lsProvider
            this._setupEvents()
            this._cacheProviderData()
          } else {
            localStorage.removeItem(`WEB3CONNECT:PROVIDER`)
          }
        })
      }
    }
  }

  _setupEvents() {
    if (this._cachedProvider) {
      console.log('setupEvents')
      this._cachedProvider.on(ConnectorEvent.Update, (data) => {
        console.log('Updated', data)
        if (data
          && data.account
          && data.account != this._cachedAddress
        ) {
          this._cachedAddress = data.account
          this.emit('accountChange')
        }
      })
      this._cachedProvider.on(ConnectorEvent.Deactivate, () => {
        console.log('Disconnected')
        this._cachedProvider = null
        localStorage.removeItem(`WEB3CONNECT:PROVIDER`)
        this.emit('disconnect')
      })
    }
  }

  async _cacheProviderData() {
    this._cachedAddress = await this._cachedProvider.getAccount()
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
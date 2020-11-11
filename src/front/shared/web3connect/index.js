import config from 'helpers/externalConfig'

import SUPPORTED_PROVIDERS from './supported_providers'
import getProviderByName from './providers'


console.log('SUPPORTED_PROVIDERS', SUPPORTED_PROVIDERS)
console.log('getProviderByName', getProviderByName)
window.getProviderByName = getProviderByName

export default class Web3Connect {
  _cachedProvider = null
  _cachedChainId = null
  _cachedAddress = null


  async __construct() {
    // Предыдущий провайдер (после перезагрузки восстанавливаем его)
    const cachedProviderName = localStorage.getItem(`WEB3CONNECT:PROVIDER`)
    if (cachedProviderName) {
      const lsProvider = getProviderByName(cachedProviderName)
      if (lsProvider) {
        if (await this._isConnected(lsProvider)) {
          _cachedProvider = lsProvider
        }
      }
    }
  }

  _cacheProviderData() {
  }

  async _isConnected(provider) {
    // Проверяем соединение. Есть несколько частных случаев
    if (typeof provider.isAuthorized === `function`) {
      return await provider.isAuthorized()
    }
  }

  isConnected() {
  }

  isCorrectNetwork() {
  }

  getWeb3() {
  }

  getAddress() {
  }

  connect() {
  }

  disconnect() {
  }
}
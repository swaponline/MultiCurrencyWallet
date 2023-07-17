import InjectedProvider from './InjectedProvider'
import WalletConnectProvider from './WalletConnectProvider'
import WalletConnectProviderV2 from './WalletConnectProviderV2'
import SUPPORTED_PROVIDERS from './supported'

export const isInjectedEnabled = () => {
  return (window && window.ethereum)
}

const _cachedProviders = {}

const getProviderByName = (web3connect, providerName, newInstance = false) => {
  return new Promise(async (resolve) => {
    if (!_cachedProviders[providerName] || newInstance) {
      switch (providerName) {
        case SUPPORTED_PROVIDERS.INJECTED:
          _cachedProviders[providerName] = new InjectedProvider(web3connect, {
            supportedChainIds: [
              web3connect._web3ChainId,
            ],
          })
          resolve(_cachedProviders[providerName])
          break
        case SUPPORTED_PROVIDERS.WALLETCONNECT:
          _cachedProviders[providerName] = new WalletConnectProviderV2(web3connect, {
            rpc: web3connect._web3RPC,
            chainId: Number(web3connect._web3ChainId),
            bridge: `https://bridge.walletconnect.org`,
            qrcode: true,
            pollingInterval: 12000,
          })
          await _cachedProviders[providerName].initProvider()
          resolve(_cachedProviders[providerName])
          break
        default:
          console.error('web3connect - not supported provider', providerName)
          resolve(false)
          break
      }
    } else {
      resolve(_cachedProviders[providerName])
    }
  })
}

export default getProviderByName
import InjectedProvider from './InjectedProvider'
import WalletConnectProvider from './WalletConnectProvider'
import SUPPORTED_PROVIDERS from './supported'



export const isInjectedEnabled = () => {
  return (window && window.ethereum)
}

const _cachedProviders = {}

const getProviderByName = (web3connect, providerName, newInstance) => {
  if (!_cachedProviders[providerName] || newInstance) {
    switch (providerName) {
      case SUPPORTED_PROVIDERS.INJECTED:
        _cachedProviders[providerName] = new InjectedProvider(web3connect, {
          supportedChainIds: [
            web3connect._web3ChainId,
          ],
        })
        return _cachedProviders[providerName]
      case SUPPORTED_PROVIDERS.WALLETCONNECT:
        const rpc = {}
        rpc[web3connect._web3ChainId] = web3connect._web3RPC

        _cachedProviders[providerName] = new WalletConnectProvider(web3connect, {
          rpc,
          bridge: `https://bridge.walletconnect.org`,
          qrcode: true,
          pollingInterval: 12000,
        })
        return _cachedProviders[providerName]
      default:
        console.error('web3connect - not supported provider', providerName)
    }
  } else {
    return _cachedProviders[providerName]
  }
}

export default getProviderByName
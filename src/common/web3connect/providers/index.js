import InjectedProvider from './InjectedProvider'
import WalletConnectProvider from './WalletConnectProvider'
import SUPPORTED_PROVIDERS from './supported'



export const isInjectedEnabled = () => {
  return (window && window.ethereum)
}

const getProviderByName = (web3connect, providerName) => {
  switch (providerName) {
    case SUPPORTED_PROVIDERS.INJECTED:
      return new InjectedProvider(web3connect, {
        supportedChainIds: [
          web3connect._web3ChainId,
        ],
      })
    case SUPPORTED_PROVIDERS.WALLETCONNECT:
      const rpc = {}
      rpc[web3connect._web3ChainId] = web3connect._webRPC
      return new WalletConnectProvider(web3connect, {
        rpc,
        bridge: `https://bridge.walletconnect.org`,
        qrcode: true,
        pollingInterval: 12000,
      })
    default:
      console.error('web3connect - not supported provider', providerName)
  }
}

export default getProviderByName
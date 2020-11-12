import config from 'helpers/externalConfig'

import InjectedProvider from './InjectedProvider'
import WalletConnectProvider from './WalletConnectProvider'


import SUPPORTED_PROVIDERS from './supported'

const chainId = (process.env.MAINNET) ? 1 : 4
const rpc = {}
rpc[`${chainId}`] = config.web3.provider


const injectOptions = {
  supportedChainIds: [
    chainId
  ]
}

const walletconnectOptions = {
  rpc,
  bridge: `https://bridge.walletconnect.org`,
  qrcode: true,
  pollingInterval: 12000,
}

export const isInjectedEnabled = () => {
  return (window && window.ethereum)
}

const getProviderByName = (web3connect, providerName) => {
  switch (providerName) {
    case SUPPORTED_PROVIDERS.INJECTED:
      return new InjectedProvider(web3connect, injectOptions)
    case SUPPORTED_PROVIDERS.WALLETCONNECT:
      return new WalletConnectProvider(web3connect, walletconnectOptions)
    default:
      console.error('web3connect - not supported provider', providerName)
  }
}

export default getProviderByName
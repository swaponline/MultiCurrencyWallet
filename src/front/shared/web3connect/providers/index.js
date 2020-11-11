import config from 'helpers/externalConfig'

import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'


import SUPPORTED_PROVIDERS from './supported_providers'

const chainId = (process.env.MAINNET) ? 1 : 4
const rpc = {}
rpc[`${chainId}`] = config.web3.provider


const injected = new InjectedConnector({
  supportedChainIds: [
    chainId
  ]
})
injected.isConnected = async () => {
  return await injected.isAuthorized()
}

const walletconnect = new WalletConnectConnector({
  rpc,
  bridge: `https://bridge.walletconnect.org`,
  qrcode: true,
  pollingInterval: 12000,
})
walletconnect.isConnected = async () => {
  try {
    const address = await walletconnect.getAccount()
    return (address) ? true : false
  } catch (err) {
    return false
  }
}


const getProviderByName = (providerName) => {
  switch (providerName) {
    case SUPPORTED_PROVIDERS.INJECTED:
      return injected
    case SUPPORTED_PROVIDERS.WALLETCONNECT:
      return walletconnect
    default:
      console.error('web3connect - not supported provider', providerName)
  }
}

export default getProviderByName
import iconDefault from './unknown.svg'
import iconOpera from './opera.svg'
import iconWalletConnect from './walletconnect.svg'
import iconLiquality from './liquality.png'
import iconMetamask from './metamask.svg'
import iconTrustWallet from './trust.svg'
import iconClose from './close.svg'
import iconWalletPreview from './walletPreview.svg'
import iconExchangePreview from './exchangePreview.svg'

export const regularIcons = {
  CLOSE: iconClose,
  WALLET_PREVIEW: iconWalletPreview,
  EXCHANGE_PREVIEW: iconExchangePreview,
}

const web3Icons = {
  METAMASK: iconMetamask,
  TRUST: iconTrustWallet,
  OPERA: iconOpera,
  NONE: iconDefault,
  UNKNOWN: iconDefault,
  LIQUALITY: iconLiquality,
  WALLETCONNECT: iconWalletConnect,
}

export default web3Icons

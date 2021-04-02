import iconDefault from './unknown.svg'
import iconOpera from './opera.svg'
import iconWalletConnect from './walletconnect.svg'
import iconLiquality from './liquality.png'
import iconMetamask from './metamask.svg'
import iconTrustWallet from './trust.svg'
import close from './close.svg'

// TODO: rename: web3Icons -> images (for example)
// TODO: add in this folder all images from project

const web3Icons = {
  METAMASK: iconMetamask,
  TRUST: iconTrustWallet,
  OPERA: iconOpera,
  NONE: iconDefault,
  UNKNOWN: iconDefault,
  LIQUALITY: iconLiquality,
  WALLETCONNECT: iconWalletConnect,

  close,
}

export default web3Icons

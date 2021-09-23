import iconDefault from './unknown.svg'
import iconOpera from './opera.svg'
import iconWalletConnect from './walletconnect.svg'
import iconLiquality from './liquality.png'
import iconMetamask from './metamask.svg'
import iconTrustWallet from './trust.svg'
import iconClose from './close.svg'
import iconOk from './ok.svg'
import iconChecked from './checked.svg'
import iconCancelled from './cancelled.svg'
import iconPending from './pending.svg'

export const regularIcons = {
  CLOSE: iconClose,
  OK: iconOk,
  CHECKED: iconChecked,
  CANCELLED: iconCancelled,
  PENDING: iconPending,
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

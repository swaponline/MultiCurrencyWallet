export type WalletApp = {
  id: string
  title: string
  menuTitle?: string
  description: string
  iconSymbol?: string
  routeUrl: string
  supportedChains: string[]
  walletBridge?: 'none' | 'eip1193'
  isInternal?: boolean
}

const EXTERNAL_ALLOWED_HOSTS = new Set([
  'app.uniswap.org',
  'dex.onout.org',
])

export const walletAppsCatalog: WalletApp[] = [
  {
    id: 'swapio-exchange',
    title: 'Swap.Online Exchange',
    menuTitle: 'Exchange App',
    description: 'Current Swap.Online exchange opened in in-wallet Apps container.',
    iconSymbol: 'SO',
    routeUrl: '/exchange/quick',
    supportedChains: ['Bitcoin', 'Ethereum', 'BSC', 'Polygon'],
    walletBridge: 'none',
    isInternal: true,
  },
  {
    id: 'onout-dex',
    title: 'Onout DEX',
    menuTitle: 'Onout DEX',
    description: 'Onout DEX opened inside wallet container for seamless swap flow.',
    iconSymbol: 'OD',
    routeUrl: 'https://dex.onout.org/?walletBridge=swaponline',
    supportedChains: ['Ethereum', 'BSC', 'Polygon'],
    walletBridge: 'eip1193',
  },
  {
    id: 'uniswap',
    title: 'Uniswap',
    menuTitle: 'Uniswap',
    description: 'Uniswap dApp in embedded mode for seamless swap flow from wallet.',
    iconSymbol: 'UNI',
    routeUrl: 'https://app.uniswap.org/#/swap',
    supportedChains: ['Ethereum', 'Arbitrum', 'Base'],
    walletBridge: 'eip1193',
  },
]

export const defaultWalletAppId = 'onout-dex'

export const getWalletAppById = (appId?: string): WalletApp | undefined => {
  if (!appId) {
    return undefined
  }

  return walletAppsCatalog.find((app) => app.id === appId)
}

export const resolveWalletAppUrl = (
  app: WalletApp,
  currentLocation: Location = window.location
): string => {
  if (!app.isInternal) {
    return app.routeUrl
  }

  const routePath = app.routeUrl.startsWith('/') ? app.routeUrl : `/${app.routeUrl}`

  return `${currentLocation.origin}${currentLocation.pathname}#${routePath}`
}

export const isAllowedWalletAppUrl = (
  appUrl: string,
  currentLocation: Location = window.location
): boolean => {
  if (!appUrl) {
    return false
  }

  try {
    const parsedUrl = new URL(appUrl)

    if (parsedUrl.hostname === currentLocation.hostname) {
      return parsedUrl.protocol === currentLocation.protocol
    }

    return parsedUrl.protocol === 'https:' && EXTERNAL_ALLOWED_HOSTS.has(parsedUrl.hostname)
  } catch (error) {
    return false
  }
}

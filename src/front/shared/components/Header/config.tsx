import { defineMessages } from 'react-intl'
import links from 'helpers/links'
import externalConfig from 'helpers/externalConfig'
import metamask from 'helpers/metamask'
import { getWalletAppById } from 'pages/Apps/appsCatalog'


const isWidgetBuild = externalConfig && externalConfig.isWidget
const isChromeExtension = externalConfig && externalConfig.dir === 'chrome-extension/application'
const onlyEvmWallets = (externalConfig?.opts?.ui?.disableInternalWallet) ? true : false

const getAppsUiConfig = () => {
  const appsUiConfig = externalConfig?.opts?.ui?.apps || {}

  const headerPinnedIds = Array.isArray(appsUiConfig.headerPinnedIds)
    ? appsUiConfig.headerPinnedIds
    : []

  const replaceExchangeWithAppId = typeof appsUiConfig.replaceExchangeWithAppId === 'string'
    ? appsUiConfig.replaceExchangeWithAppId
    : ''

  return {
    headerPinnedIds,
    replaceExchangeWithAppId,
  }
}

const mapToUniqueLinks = (items) => {
  const usedLinks = {}

  return items.filter((item) => {
    if (!item || !item.link) {
      return false
    }

    if (usedLinks[item.link]) {
      return false
    }

    usedLinks[item.link] = true

    return true
  })
}

const buildAppMenuItem = (appId, icon?) => {
  const app = getWalletAppById(appId)

  if (!app) {
    return false
  }

  return {
    title: app.menuTitle || app.title,
    link: `${links.apps}/${app.id}`,
    exact: false,
    currentPageFlag: true,
    ...(icon ? { icon } : {}),
  }
}


export const messages = defineMessages({
  wallet: {
    id: 'menu.wallet',
    description: 'Menu item "Wallet"',
    defaultMessage: 'Wallet',
  },
  createWallet: {
    id: 'menu.CreateWallet',
    description: 'Menu item "Wallet"',
    defaultMessage: 'Create wallet',
  },
  exchange: {
    id: 'menu.exchange',
    description: 'Menu item "Exchange"',
    defaultMessage: 'Exchange',
  },
  apps: {
    id: 'menu.apps',
    description: 'Menu item "Apps"',
    defaultMessage: 'Apps',
  },
  history: {
    id: 'menu.history',
    description: 'Menu item "History"',
    defaultMessage: 'Transactions',
  },
  marketmaker: {
    id: 'menu.marketmaker',
    description: 'Menu item "Marketmaker"',
    defaultMessage: 'Earn',
  },
})

export const getMenuItems = (props) => {
  const { intl } = props
  const { exchange, wallet, createWallet, history, apps } = messages
  const { headerPinnedIds, replaceExchangeWithAppId } = getAppsUiConfig()
  const { 
    exchange: exchangeLink,
    quickSwap,
    apps: appsLink,
    createWallet: create,
    history: historyLink,
    home,
  } = links

  const exchangeAsAppMenuItem = buildAppMenuItem(replaceExchangeWithAppId)
  const pinnedAppsMenuItems = headerPinnedIds
    .map((appId) => buildAppMenuItem(appId))
    .filter(Boolean)

  const exchangeMenuItem = !externalConfig.opts.exchangeDisabled && (
    exchangeAsAppMenuItem || {
      title: intl.formatMessage(exchange),
      link: quickSwap,
      exact: false,
      currentPageFlag: true,
    }
  )

  const itemsWithWallet = mapToUniqueLinks([
    {
      title: intl.formatMessage(wallet),
      link: home,
      exact: true,
      currentPageFlag: true,
    },
    {
      title: intl.formatMessage(history),
      link: historyLink,
      exact: true,
      currentPageFlag: true,
    },
    exchangeMenuItem,
    {
      title: intl.formatMessage(apps),
      link: appsLink,
      exact: false,
      currentPageFlag: true,
    },
    ...pinnedAppsMenuItems,
  ])

  const itemsWithoutWallet = mapToUniqueLinks([
    !onlyEvmWallets && {
      title: intl.formatMessage(createWallet),
      link: create,
      exact: true,
      currentPageFlag: true,
    },
    !externalConfig.opts.exchangeDisabled && (
      exchangeAsAppMenuItem || {
        title: intl.formatMessage(exchange),
        link: exchangeLink,
        exact: false,
        currentPageFlag: true,
      }
    ),
    ...pinnedAppsMenuItems,
  ])

  // Marketmaker pages ********
  if (!isWidgetBuild) {
    const marketmakerItem = {
      title: intl.formatMessage(messages.marketmaker),
      link: (externalConfig.opts.ui.farmLink)
        ? externalConfig.opts.ui.farmLink
        : !isChromeExtension ? `${links.marketmaker}/` : `${links.marketmaker}/{MATIC}WBTC`,
      exact: true,
      currentPageFlag: true,
      isExternal: (externalConfig.opts.ui.farmLink) ? true : false
    }

    itemsWithWallet.push(marketmakerItem)
    itemsWithoutWallet.push(marketmakerItem)
  }

  if (onlyEvmWallets && metamask.isConnected()) return itemsWithWallet

  return localStorage.getItem('isWalletCreate') === 'true'
    || externalConfig && externalConfig.isWidget
      ? itemsWithWallet
      : itemsWithoutWallet
}


export const getMenuItemsMobile = (props, isWalletCreate, dinamicPath) => {
  const { intl } = props
  const { exchange, wallet, createWallet, history, apps } = messages
  const { headerPinnedIds, replaceExchangeWithAppId } = getAppsUiConfig()
  const { 
    exchange: exchangeLink,
    quickSwap,
    apps: appsLink,
    history: historyLink,
  } = links

  const exchangeAsAppMobileMenuItem = buildAppMenuItem(
    replaceExchangeWithAppId,
    <i className="fas fa-sync-alt" aria-hidden="true" />
  )
  const pinnedMobileApps = headerPinnedIds
    .map((appId) => buildAppMenuItem(
      appId,
      <i className="fas fa-th-large" aria-hidden="true" />
    ))
    .filter(Boolean)

  const mobileItemsWithWallet = mapToUniqueLinks([
    {
      title: intl.formatMessage(isWalletCreate ? wallet : createWallet),
      link: dinamicPath,
      exact: true,
      icon: <i className="fa fa-home" aria-hidden="true" />,
    },
    {
      title: props.intl.formatMessage(history),
      link: historyLink,
      displayNone: !isWalletCreate,
      icon: <i className="fas fa-exchange-alt" aria-hidden="true" />,
    },
    !externalConfig.opts.exchangeDisabled && (
      exchangeAsAppMobileMenuItem || {
        title: intl.formatMessage(exchange),
        link: quickSwap,
        exact: false,
        icon: <i className="fas fa-sync-alt" aria-hidden="true" />,
      }
    ),
    {
      title: intl.formatMessage(apps),
      link: appsLink,
      exact: false,
      icon: <i className="fas fa-th-large" aria-hidden="true" />,
    },
    ...pinnedMobileApps,
  ])

  const mobileItemsWithoutWallet = mapToUniqueLinks([
    {
      title: intl.formatMessage(createWallet),
      link: dinamicPath,
      exact: true,
      icon: <i className="fa fa-home" aria-hidden="true" />,
    },
    !externalConfig.opts.exchangeDisabled && (
      exchangeAsAppMobileMenuItem || {
        title: intl.formatMessage(exchange),
        link: exchangeLink,
        exact: false,
        icon: <i className="fas fa-sync-alt" aria-hidden="true" />,
      }
    ),
    ...pinnedMobileApps,
  ])

  if (onlyEvmWallets) return mobileItemsWithWallet
  return localStorage.getItem('isWalletCreate') === 'true'
      ? mobileItemsWithWallet
      : mobileItemsWithoutWallet
}

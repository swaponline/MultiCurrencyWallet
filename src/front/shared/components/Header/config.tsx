import { defineMessages } from 'react-intl'
import links from 'helpers/links'
import externalConfig from 'helpers/externalConfig'
import metamask from 'helpers/metamask'


const isWidgetBuild = externalConfig && externalConfig.isWidget
const isChromeExtension = externalConfig && externalConfig.dir === 'chrome-extension/application'
const onlyEvmWallets = (externalConfig?.opts?.ui?.disableInternalWallet) ? true : false


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
  const { exchange, wallet, createWallet, history } = messages
  const { 
    exchange: exchangeLink,
    quickSwap,
    createWallet: create,
    history: historyLink,
    home,
  } = links

  const itemsWithWallet = [
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
    !externalConfig.opts.exchangeDisabled && {
      title: intl.formatMessage(exchange),
      link: quickSwap,
      exact: false,
      currentPageFlag: true,
    },
  ]

  const itemsWithoutWallet = [
    !onlyEvmWallets && {
      title: intl.formatMessage(createWallet),
      link: create,
      exact: true,
      currentPageFlag: true,
    },
    !externalConfig.opts.exchangeDisabled && {
      title: intl.formatMessage(exchange),
      link: exchangeLink,
      exact: false,
      currentPageFlag: true,
    },
  ]

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
  const { exchange, wallet, createWallet, history } = messages
  const { 
    exchange: exchangeLink,
    quickSwap,
    history: historyLink,
  } = links

  const mobileItemsWithWallet = [
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
    !externalConfig.opts.exchangeDisabled && {
      title: intl.formatMessage(exchange),
      link: quickSwap,
      exact: false,
      icon: <i className="fas fa-sync-alt" aria-hidden="true" />,
    },
  ]

  const mobileItemsWithoutWallet = [
    {
      title: intl.formatMessage(createWallet),
      link: dinamicPath,
      exact: true,
      icon: <i className="fa fa-home" aria-hidden="true" />,
    },
    !externalConfig.opts.exchangeDisabled && {
      title: intl.formatMessage(exchange),
      link: exchangeLink,
      exact: false,
      icon: <i className="fas fa-sync-alt" aria-hidden="true" />,
    },
  ]

  if (onlyEvmWallets) return mobileItemsWithWallet
  return localStorage.getItem('isWalletCreate') === 'true'
      ? mobileItemsWithWallet
      : mobileItemsWithoutWallet
}


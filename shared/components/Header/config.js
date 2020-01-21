import React from 'react'
import { FormattedMessage, defineMessages } from 'react-intl'
import links from 'helpers/links'
import config from 'app-config'


export const messages = defineMessages({
  products: {
    id: 'menu.products',
    description: 'Menu item "Wallet"',
    defaultMessage: 'Our products',
  },
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
  IEO: {
    id: 'menu.IEO',
    description: 'Menu item "IEO"',
    defaultMessage: 'Earn',
  },
  invest: {
    id: 'menu.invest.info',
    description: 'Menu item "Transactions"',
    defaultMessage: 'How to invest?',
  },
  investMobile: {
    id: 'menu.invest',
    description: 'Menu item "Transactions"',
    defaultMessage: 'Invest',
  },
})

export const getMenuItems = (props, isWalletCreate) => {
  const { intl, reputation, isSigned } = props

  const { exchange: linksExchange, createWallet: create, home } = links
  const { exchange, wallet, createWallet } = messages

  return (Number.isInteger(reputation) && reputation !== 0)
    || isSigned
    || localStorage.getItem('isWalletCreate') === 'true'
    || (config && config.isWidget)
    ? ([
      {
        title: intl.formatMessage(wallet),
        link: home,
        exact: true,
        haveSubmenu: true,
        icon: 'products',
        currentPageFlag: true,
      },
      {
        title: intl.formatMessage(exchange),
        link: linksExchange,
        exact: true,
        haveSubmenu: true,
        icon: 'products',
        currentPageFlag: true,
      },
      // {
      //   title: props.intl.formatMessage(messages.history),
      //   link: links.history,
      //   icon: 'history',
      //   haveSubmenu: false,
      //   displayNone: !isWalletCreate,
      // },
      // {
      //   title: props.intl.formatMessage(messages.IEO),
      //   link: links.ieo,
      //   icon: 'IEO',
      //   haveSubmenu: false,
      // },
    ])
    : ([
      {
        title: intl.formatMessage(createWallet),
        link: create,
        exact: true,
        haveSubmenu: true,
        icon: 'products',
        currentPageFlag: true,
      },
      {
        title: intl.formatMessage(exchange),
        link: linksExchange,
        exact: true,
        haveSubmenu: true,
        icon: 'products',
        currentPageFlag: true,
      },
      // {
      //   title: props.intl.formatMessage(messages.history),
      //   link: links.history,
      //   icon: 'history',
      //   haveSubmenu: false,
      //   displayNone: !isWalletCreate,
      // },
    ])
}


export const getMenuItemsMobile = (props, isWalletCreate, dinamicPath) => {
  const { intl, reputation, isSigned } = props

  const { exchange: linksExchange, createWallet: create, home } = links
  const { exchange, wallet, createWallet } = messages

  return (Number.isInteger(reputation) && reputation !== 0) || isSigned
    || localStorage.getItem('isWalletCreate') === 'true'
    ? ([
      {
        title: intl.formatMessage(isWalletCreate ? wallet : createWallet),
        link: dinamicPath,
        exact: true,
        haveSubmenu: true,
        icon: <i className="fa fa-home" aria-hidden="true" />,
      },
      {
        title: props.intl.formatMessage(messages.history),
        link: links.history,
        haveSubmenu: false,
        displayNone: !isWalletCreate,
        icon: <i className="fas fa-exchange-alt" aria-hidden="true" />,
      },
      {
        title: intl.formatMessage(exchange),
        link: linksExchange,
        exact: true,
        haveSubmenu: true,
        icon: <i className="fas fa-sync-alt" aria-hidden="true" />,
      },
    ])
    : ([
      {
        title: intl.formatMessage(createWallet),
        link: create,
        exact: true,
        haveSubmenu: true,
        icon: <i className="fas fa-wallet" aria-hidden="true" />,
        currentPageFlag: true,
      },
      {
        title: intl.formatMessage(exchange),
        link: linksExchange,
        exact: true,
        haveSubmenu: true,
        icon: <i className="fas fa-sync-alt" aria-hidden="true" />,
      },
    ])
}


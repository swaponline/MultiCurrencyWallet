import React from 'react'
import { FormattedMessage, defineMessages } from 'react-intl'
import links from 'helpers/links'


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
    defaultMessage: 'My history',
  },
  IEO: {
    id: 'menu.IEO',
    description: 'Menu item "IEO"',
    defaultMessage: 'Earn',
  },
  invest: {
    id: 'menu.invest',
    description: 'Menu item "My History"',
    defaultMessage: 'How to invest?',
  },
  investMobile: {
    id: 'menu.invest',
    description: 'Menu item "My History"',
    defaultMessage: 'Invest',
  },
})

export const getMenuItems = (props, isWalletCreated) => {
  const { intl, reputation, isSigned } = props

  const { exchange: linksExchange, createWallet: create, home } = links
  const { exchange, wallet, createWallet } = messages

  return (Number.isInteger(reputation) && reputation !== 0)
    || isSigned
    || localStorage.getItem('isWalletCreate') === 'true'
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
      //   displayNone: !isWalletCreated,
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
      //   displayNone: !isWalletCreated,
      // },
    ])
}


export const getMenuItemsMobile = (props, isWalletCreated, dinamicPath) => {
  const { intl } = props
  const { exchange, wallet, createWallet } = messages
  const { exchange: linksExchange } = links

  return ([
    {
      title: intl.formatMessage(isWalletCreated ? wallet : createWallet),
      link: dinamicPath,
      exact: true,
      haveSubmenu: true,
      icon: 'products',
    },
    {
      title: intl.formatMessage(exchange),
      link: linksExchange,
      exact: true,
      haveSubmenu: true,
      icon: 'products',
    },
    // {
    //   title: props.intl.formatMessage(messages.history),
    //   link: links.history,
    //   icon: 'history',
    //   haveSubmenu: false,
    //   displayNone: !isWalletCreated,
    // },
  ])
}


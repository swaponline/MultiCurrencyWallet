import React from 'react'
import { defineMessages } from 'react-intl'
import links from 'helpers/links'
import externalConfig from 'helpers/externalConfig'


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
  farm: {
    id: 'menu.farm',
    description: 'Menu item "Staking & Farming"',
    defaultMessage: 'Staking & Farming',
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
  const { exchange, wallet, createWallet } = messages
  const { 
    exchange: linksExchange,
    createWallet: create,
    farm,
    history,
    home,
  } = links

  const itemsWithWallet = [
    {
      title: intl.formatMessage(wallet),
      link: home,
      exact: true,
      haveSubmenu: true,
      icon: 'products',
      currentPageFlag: true,
    },
    {
      title: intl.formatMessage(messages.history),
      link: history,
      exact: true,
      haveSubmenu: true,
      icon: 'products',
      currentPageFlag: true,
    },
    !externalConfig.opts.exchangeDisabled && {
      title: intl.formatMessage(exchange),
      link: linksExchange,
      exact: true,
      haveSubmenu: true,
      icon: 'products',
      currentPageFlag: true,
    },
  ]

  const itemsWithoutWallet = [
    {
      title: intl.formatMessage(createWallet),
      link: create,
      exact: true,
      haveSubmenu: true,
      icon: 'products',
      currentPageFlag: true,
    },
    !externalConfig.opts.exchangeDisabled && {
      title: intl.formatMessage(exchange),
      link: linksExchange,
      exact: true,
      haveSubmenu: true,
      icon: 'products',
      currentPageFlag: true,
    },
  ]

  // Farm plugin ****************************

  let hasFarmInitOprions = false

  if (window.farm) {
    const { farmAddress, rewardsAddress, stakingAddress } = window.farm

    hasFarmInitOprions = farmAddress && rewardsAddress && stakingAddress && true
  }

  if (hasFarmInitOprions) {
    const farmItem = {
      title: intl.formatMessage(messages.farm),
      link: farm,
      exact: true,
      haveSubmenu: true,
      icon: 'products',
      currentPageFlag: true,
    }

    itemsWithWallet.push(farmItem)
    itemsWithoutWallet.push(farmItem)
  }

  // ***************************************

  return (Number.isInteger(reputation) && reputation !== 0)
    || isSigned
    || localStorage.getItem('isWalletCreate') === 'true'
    || (externalConfig && externalConfig.isWidget)
      ? itemsWithWallet
      : itemsWithoutWallet
}


export const getMenuItemsMobile = (props, isWalletCreate, dinamicPath) => {
  const { intl, reputation, isSigned } = props
  const { exchange, wallet, createWallet } = messages
  const { 
    exchange: linksExchange,
    farm,
    history,
  } = links

  const mobileItemsWithWallet = [
    {
      title: intl.formatMessage(isWalletCreate ? wallet : createWallet),
      link: dinamicPath,
      exact: true,
      haveSubmenu: true,
      icon: <i className="fa fa-home" aria-hidden="true" />,
    },
    {
      title: props.intl.formatMessage(messages.history),
      link: history,
      haveSubmenu: false,
      displayNone: !isWalletCreate,
      icon: <i className="fas fa-exchange-alt" aria-hidden="true" />,
    },
    !externalConfig.opts.exchangeDisabled && {
      title: intl.formatMessage(exchange),
      link: linksExchange,
      exact: true,
      haveSubmenu: true,
      icon: <i className="fas fa-sync-alt" aria-hidden="true" />,
    },
  ]

  const mobileItemsWithoutWallet = [
    {
      title: intl.formatMessage(createWallet),
      link: dinamicPath,
      exact: true,
      haveSubmenu: true,
      icon: <i className="fa fa-home" aria-hidden="true" />,
    },
    !externalConfig.opts.exchangeDisabled && {
      title: intl.formatMessage(exchange),
      link: linksExchange,
      exact: true,
      haveSubmenu: true,
      icon: <i className="fas fa-sync-alt" aria-hidden="true" />,
    },
  ]

  // Farm plugin ****************************

  let hasFarmInitOprions = false

  if (window.farm) {
    const { farmAddress, rewardsAddress, stakingAddress } = window.farm

    hasFarmInitOprions = farmAddress && rewardsAddress && stakingAddress && true
  }

  if (hasFarmInitOprions) {
    const farmItem = {
      title: props.intl.formatMessage(messages.farm),
      link: farm,
      exact: true,
      haveSubmenu: true,
      icon: <i className="fas fa-coins" aria-hidden="true" />,
    }

    mobileItemsWithWallet.push(farmItem)
    mobileItemsWithoutWallet.push(farmItem)
  }

  // *****************************************

  return (Number.isInteger(reputation) && reputation !== 0) || isSigned
    || localStorage.getItem('isWalletCreate') === 'true'
      ? mobileItemsWithWallet
      : mobileItemsWithoutWallet
}


import React from 'react'

import CSSModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'

import { links } from 'helpers'
import config from 'helpers/externalConfig'

import styles from './styles.scss'


const isWidgetBuild = config && config.isWidget

const TabsComponent = ({ navs, onClick, activeView }) => {

  const defaultNavs = [
    {
      key: 'My balances',
      text: <FormattedMessage id="MybalanceswalletNav" defaultMessage="Мои кошельки" />,
      link: links.home,
      enabled: true,
    },
    {
      key: 'Transactions',
      text: <FormattedMessage id="TransactionswalletNav" defaultMessage="История" />,
      link: links.history,
      enabled: true,
    },
    {
      key: 'Invoices',
      text: <FormattedMessage id="InvoicesNav" defaultMessage="Запросы" />,
      link: links.invoices,
      enabled: (!isWidgetBuild && config.opts.invoiceEnabled),
    },
  ]

  const renderNavs = navs || defaultNavs
  const tabRenderer = ({ key, text, link, enabled }, index) => {

    const handleClick = () => {
      if (activeView !== index) {
        onClick(index)
      }
    }

    const styleName = `walletNavItem ${activeView === index ? 'active' : ''}`
    return (
      enabled ? (
        <li
          key={key}
          role="presentation"
          styleName={styleName}
          onClick={handleClick}
        >
          <a href={`#${link}`} styleName="walletNavItemLink">
            {text}
          </a>
        </li>
      ) : null
    )
  }
  return (
    <ul styleName="walletNav">
      {renderNavs.map(tabRenderer)}
    </ul>
  )
}

TabsComponent.defaultProps = {
  currency: "",
  onClick: () => { }
}

export default CSSModules(TabsComponent, styles, { allowMultiple: true })
import React from 'react'
import { connect } from 'redaction'
import cx from 'classnames'

import CSSModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'

import { links } from 'helpers'
import config from 'helpers/externalConfig'

import styles from './styles.scss'
import constants from 'helpers/constants'
import { isMobile } from 'react-device-detect'


const isWidgetBuild = config && config.isWidget

const invoicesEnabled = (localStorage.getItem(constants.localStorage.invoicesEnabled) === '1')

const TabsComponent = ({ navs, onClick, activeView, dashboardView, modals }) => {

  const isAnyModalCalled = Object.keys(modals).length

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
      enabled: !isMobile,
    },
    {
      key: 'Invoices',
      text: <FormattedMessage id="InvoicesNav" defaultMessage="Запросы" />,
      link: links.invoices,
      enabled: (!isWidgetBuild && config.opts.invoiceEnabled && invoicesEnabled),
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
    <ul
      className={cx({
        [styles.walletNav]: true,
        [styles.blured]: dashboardView && isAnyModalCalled,
      })}
    >
      {renderNavs.map(tabRenderer)}
    </ul>
  )
}

TabsComponent.defaultProps = {
  currency: '',
  onClick: () => { },
}

export default connect(({
  modals,
  ui: { dashboardModalsAllowed },
}) => ({
  modals,
  dashboardView: dashboardModalsAllowed,
}))(CSSModules(TabsComponent, styles, { allowMultiple: true }))

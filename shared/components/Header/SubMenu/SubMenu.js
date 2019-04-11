import React from 'react'
import PropTypes from 'prop-types'

import links from 'helpers/links'
import { FormattedMessage } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './SubMenu.scss'
import { localisedUrl } from 'helpers/locale'


const subMenuItems = [
  { link: "/exchange",                  title: <FormattedMessage id="FooterOurProductsExchange" defaultMessage="Exchange" /> },
  { link: "/",                          title: <FormattedMessage id="FooterOurProductsWallet" defaultMessage="Wallet" /> },
  { link: links.footer.widget,          title: <FormattedMessage id="FooterOurProductsWidget" defaultMessage="Widget" /> },
  { link: links.footer.chromeextantion, title: <FormattedMessage id="FooterOurProductsChromeExtantion" defaultMessage="Chrome extantion" /> },
  { link: links.footer.bankdashboard,   title: <FormattedMessage id="FooterOurProductsBankDashboard" defaultMessage="Bank dashboard" /> },
]

const SubMenu = ({ className, styleName, history, locale }) => (
  <ul styleName="submenu">
    {subMenuItems.map((item, index) => (
      <li styleName="submenu-item" key={index}>
        {index < 2 ?
          <a onClick={() => history.push(localisedUrl(locale, item.link))}>{item.title}</a> :
          <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
        }
      </li>
    ))}
  </ul>
)

export default CSSModules(SubMenu, styles)

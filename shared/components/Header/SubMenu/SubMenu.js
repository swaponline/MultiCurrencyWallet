import React from 'react'
import PropTypes from 'prop-types'

import links from 'helpers/links'
import { FormattedMessage } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './SubMenu.scss'
import { localisedUrl } from 'helpers/locale'


const subMenuItems = [
  {
    link: '/exchange',
    title: <FormattedMessage id="Swap.OnlineSubmenu" defaultMessage="Swap.Exhange" />,
    description: <FormattedMessage id="Submenu16" defaultMessage="Fast atomic swap exchanges BTC, ETH, LTC, ERC20 online" />,
    image: "https://img.icons8.com/wired/30/000000/transfer-between-users.png"
  },
  {
    link: '/',
    title: <FormattedMessage id="Swap.WalletSubMeny" defaultMessage="Swap.Wallet" />,
    description: <FormattedMessage id="Submenu22" defaultMessage="Cryptocurrency storage without loading wallets" />,
    image:  "https://img.icons8.com/ios/30/000000/bonds.png"
  },
  {
    link: links.footer.widget,
    title: <FormattedMessage id="Swap.WidgetSubMenu" defaultMessage="Swap.Widget" />,
    description: <FormattedMessage id="Submenu28" defaultMessage="Turn your website into a cryptocurrency portal (wallet, stock exchange, etc.)" />,
    image:  "https://img.icons8.com/wired/30/000000/r2-d2.png"
  },
  {
    link: links.footer.widget,
    title: <FormattedMessage id="launchpadSubMenu" defaultMessage="IEO launchpad" />,
    description: <FormattedMessage id="Submenu34" defaultMessage="Launch IEO on your website" />,
    image:  "https://img.icons8.com/wired/30/000000/data-protection.png"
  },
]

const SubMenu = ({ className, styleName, history, locale }) => (
  <ul styleName="submenu">
    {subMenuItems.map((item, index) => (
      <li styleName="submenu-item" key={index}>
        <img src={item.image} alt={item.title} />
        {index !== 2 ?
          <a onClick={() => history.push(localisedUrl(locale, item.link))}>{item.title}</a> :
          <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
        }
        <p>{item.description}</p>
      </li>
    ))}
  </ul>
)

export default CSSModules(SubMenu, styles)

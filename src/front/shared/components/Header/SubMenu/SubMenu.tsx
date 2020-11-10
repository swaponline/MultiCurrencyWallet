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
    title: <FormattedMessage id="Submenu" defaultMessage="Swap.Exhange" />,
    description: <FormattedMessage id="Submenu16" defaultMessage="Fast atomic swap exchanges BTC, ETH, ERC20 online" />,
    image: 'https://img.icons8.com/wired/30/000000/transfer-between-users.png',
  },
  {
    link: '/',
    title: <FormattedMessage id="Swap.WalletSubMeny" defaultMessage="Swap.Wallet" />,
    description: <FormattedMessage id="Submenu22" defaultMessage="Cryptocurrency storage without loading wallets" />,
    image: 'https://img.icons8.com/ios/30/000000/bonds.png',
  },
  {
    link: links.footer.widget,
    title: <FormattedMessage id="Swap.WidgetSubMenu" defaultMessage="Swap.Widget" />,
    description: <FormattedMessage id="Submenu28" defaultMessage="Turn your website into a cryptocurrency portal (wallet, stock exchange, etc.)" />,
    image: 'https://img.icons8.com/wired/30/000000/r2-d2.png',
  },
  {
    link: links.footer.widget,
    title: <FormattedMessage id="launchpadSubMenu" defaultMessage="IEO launchpad" />,
    description: <FormattedMessage id="Submenu34" defaultMessage="Launch IEO on your website" />,
    image: 'https://img.icons8.com/wired/30/000000/data-protection.png',
  },
]


class SubMenu extends React.PureComponent {

  props: any

  render() {
    const { className, styleName, history, locale } = this.props

    return (
      <ul styleName="submenu">
        {subMenuItems.map((item, index) => (
          <li key={index}>
            <a
              styleName="submenu-item"
              {
              ...index !== 2
                ? {
                  onClick: () => history.push(localisedUrl(locale, item.link)),
                }
                : {
                  rel: 'noopener noreferrer',
                  target: '_blank',
                  href: item.link,
                }
              }
            >
              <img src={item.image} alt={item.title} />
              <div styleName="text-container-submenu">
                <span>{item.title}</span>
                <p>{item.description}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    )
  }
}

export default CSSModules(SubMenu, styles)

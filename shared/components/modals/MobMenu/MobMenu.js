import React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'

import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import links from 'helpers/links'
import Modal from 'components/modal/Modal/Modal'
import { localisedUrl } from 'helpers/locale'

import styles from './MobMenu.scss'


@injectIntl
@cssModules(styles)
class MobMenu extends React.Component {

  constructor(props) {
    super(props)

    this.subMenuItems = [
      {
        link: '/exchange',
        title: <FormattedMessage id="Submenu" defaultMessage="Swap.Exhange" />,
        description: <FormattedMessage id="Submenu16" defaultMessage="Fast atomic swap exchanges BTC, BCH, ETH, ERC20 online" />,
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
  }

  handleClose = () => {
    const { name, data, onClose } = this.props

    if (typeof onClose === 'function') {
      onClose()
    }

    if (typeof data.onClose === 'function') {
      data.onClose()
    }

    actions.modals.close(name)
  }

  render() {
    const {
      intl,
      history,
    } = this.props

    return (
      <Modal name="MobMenu">
        <div styleName="content">
          <ul styleName="submenu">
            {this.subMenuItems.map((item, index) => (
              <li key={index}>
                <a
                  styleName="submenu-item"
                  {
                  ...index !== 2
                    ? {
                      onClick: () => history.push(localisedUrl(intl.locale, item.link)),
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
        </div>
      </Modal>

    )
  }
}

export default withRouter(MobMenu)

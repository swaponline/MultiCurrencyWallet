import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { NavLink, withRouter } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './NavMobile.scss'
import { localisedUrl } from 'helpers/locale'
import { links } from 'helpers';
import actions from 'redux/actions'
import constants from 'helpers/constants'


@injectIntl
@withRouter
@CSSModules(styles)
export default class NavMobile extends Component {

  static propTypes = {
    menu: PropTypes.array.isRequired,
  }

  

  render() {
    const {
      menu,
      intl: { locale },
      location
    } = this.props;

    console.log('props', this.props)

    const isHistory = location.pathname.includes(links.history);
    const isExchange = location.pathname.includes(links.exchange);
    const isWallet =
      location.pathname.includes(links.wallet) ||
      location.pathname === '/' ||
      location.pathname === '/ru';

    return (
      <div styleName="navbar">
        {
          menu
            .filter(i => i.isMobile !== false)
            .map(({ title, link, exact, icon, isBold, currentPageFlag, ...rest }) => !rest.displayNone && (
              currentPageFlag
                ? (
                  <a
                    key={title}
                    onClick={() => actions.modals.open(constants.modals.MobMenu, {})}
                    tabIndex="-1"
                    
                  >
                    {icon} 
                    <span className={isBold && styles.bold}>{title}</span>
                  </a>
                )
                : (
                  <NavLink
                    key={title}
                    exact={exact}
                    to={localisedUrl(locale, link)}
                    className={`
                    ${title === 'Exchange' ? 'reactour-exchange' : ''}
                    ${title === 'Exchange' && isExchange ? ` ${styles.active}` : ''}
                `}
                    activeClassName={styles.active}
                  >
                    {icon}
                    <span className={isBold && styles.bold}>{title}</span>
                  </NavLink>
                )
            ))
        }
      </div>
    )
  }
}

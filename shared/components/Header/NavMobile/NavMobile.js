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


const isDark = localStorage.getItem(constants.localStorage.isDark)

@injectIntl
@withRouter
@CSSModules(styles, { allowMultiple: true })
export default class NavMobile extends Component {

  static propTypes = {
    menu: PropTypes.array.isRequired,
  }

  render() {
    const {
      menu,
      intl: { locale },
      location,
      isHidden,
    } = this.props

    const isExchange = location.pathname.includes(links.exchange);

    return (
      <nav styleName={`navbar ${isDark ? 'dark' : ''} ${isHidden ? 'navbar-hidden' : ''}`}>
        {
          menu
            .filter(i => i.isMobile !== false)
            .map(({ title, link, exact, icon, isBold, currentPageFlag, ...rest }) => {
              return !rest.displayNone &&
                (
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
                      ${link && link.includes("history") ? 'data-tut-recent' : ''}
                      ${link && link.includes("exchange") ? 'reactour-exchange data-tut-widget-exchange' : ''}
                      ${link && link.includes("exchange") && isExchange ? ` ${styles.active}` : ''}
                    `}
                        activeClassName={styles.active}
                      >
                        {icon}
                        <span className={isBold && styles.bold}>{title}</span>
                      </NavLink>
                    )
                )
            })
        }
      </nav>
    )
  }
}

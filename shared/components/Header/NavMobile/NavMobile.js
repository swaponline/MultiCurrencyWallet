import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { NavLink } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './NavMobile.scss'
import { localisedUrl } from 'helpers/locale'


@injectIntl
@CSSModules(styles)
export default class NavMobile extends Component {

  static propTypes = {
    menu: PropTypes.array.isRequired,
  }

  render() {
    const { menu, intl: { locale } } = this.props

    return (
      <div styleName="navbar">
        {
          menu
            .filter(i => i.isMobile !== false)
            .map(({ title, link, exact, icon }) => (
              <NavLink
                key={title}
                exact={exact}
                to={localisedUrl(locale, link)}
                activeClassName={styles.active}
              >
                <i className={`fas fa-${icon}`} aria-hidden="true" />
                <span>{title}</span>
              </NavLink>
            ))
        }
      </div>
    )
  }
}

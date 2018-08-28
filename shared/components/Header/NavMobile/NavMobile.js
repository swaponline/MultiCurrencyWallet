import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { NavLink } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './NavMobile.scss'


@CSSModules(styles)
export default class NavMobile extends Component {

  static propTypes = {
    menu: PropTypes.array.isRequired,
  }

  render() {
    const { props: { menu } } = this

    return (
      <div styleName="navbar">
        {
          menu
            .filter(i => i.isMobile !== false)
            .map(({ title, link, exact, icon }) => (
              <NavLink
                key={title}
                exact={exact}
                to={link}
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

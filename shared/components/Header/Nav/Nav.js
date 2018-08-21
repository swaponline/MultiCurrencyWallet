import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { NavLink } from 'react-router-dom'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './Nav.scss'


@CSSModules(styles)
export default class Nav extends Component {

  static propTypes = {
    menu: PropTypes.array.isRequired
  }

  handleClick = () => {
    const scrollStep = -window.scrollY / (500 / 15)
    const scrollInterval = setInterval(() => {
      window.scrollY !== 0 ? window.scrollBy(0, scrollStep) : clearInterval(scrollInterval)
    }, 15)
  }

  render() {
    const { menu } = this.props

    return (
      <div styleName="nav">
        <Fragment>
          {
            menu
              .filter(i => i.isDesktop !== false)
              .map(({ title, link, exact }) => (
                <NavLink
                  onClick={this.handleClick}
                  key={title}
                  exact={exact}
                  styleName="link"
                  to={link}
                  activeClassName={styles.active}
                >
                  {title}
                </NavLink>
              ))
          }
          {
            process.env.MAINNET && (
              <a href={links.test} styleName="link" target="_blank" rel="noreferrer noopener">Testnet</a>
            )
          }
        </Fragment>
      </div>
    )
  }
}

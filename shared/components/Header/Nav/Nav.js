import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import { NavLink } from 'react-router-dom'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './Nav.scss'


@CSSModules(styles, { allowMultiple: true })
export default class Nav extends Component {

  static propTypes = {
    menu: PropTypes.array.isRequired,
  }

  state = {
    activeRoute: '/',
  }

  componentDidMount = () => {
    const path = window.location.pathname
    const menu = document.querySelector('#navmenu')
    const el = menu.querySelector(`a[href="${path}"]`)

    // TODO: Replace this hack approach

    if (el) {
      el.click()
    } else {
      menu.querySelector('a[href="/exchange"]').click()
    }
  }

  handleClick = (link) => {
    this.setState({ activeRoute: link })

    const scrollStep = -window.scrollY / (500 / 15)
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep)
      } else {
        clearInterval(scrollInterval)
      }
    }, 15)
  }

  render() {
    const { menu } = this.props
    const { activeRoute } = this.state

    return (
      <div id="navmenu" styleName="nav">
        <Fragment>
          {
            menu
              .filter(i => i.isDesktop !== false)
              .map(({ title, link, exact }) => (
                <NavLink
                  onClick={() => this.handleClick(link)}
                  key={title}
                  exact={exact}
                  styleName={cx('link', { 'active': activeRoute === link })}
                  to={link}
                  // activeClassName={styles.active}
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

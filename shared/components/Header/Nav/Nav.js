import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router'

import PropTypes from 'prop-types'
import cx from 'classnames'

import { NavLink } from 'react-router-dom'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './Nav.scss'

@withRouter
@CSSModules(styles, { allowMultiple: true })
export default class Nav extends Component {

  static propTypes = {
    menu: PropTypes.array.isRequired,
  }

  state = {
    activeRoute: '/',
  }

  handleRouteChange = (props) => {
    const activeRoute = props.location.pathname

    const pathExist = this.props.menu
      .some(m => m.link === activeRoute)

    if (pathExist) {
      this.setState({ activeRoute })
    } else {
      this.setState({ activeRoute: '/exchange' })
    }
  }

  componentDidMount = () => {
    this.handleRouteChange(this.props)
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.location.pathname === this.state.activeRoute) {
      return
    }

    this.handleRouteChange(nextProps)
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
      <div styleName="nav">
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

import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { links } from 'helpers'
import { NavLink, withRouter } from 'react-router-dom'

import cx from 'classnames'
import styles from './Nav.scss'
import CSSModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'


@withRouter
@CSSModules(styles, { allowMultiple: true })
export default class Nav extends Component {

  static propTypes = {
    menu: PropTypes.array.isRequired,
  }

  // state = {
  //   activeRoute: '/',
  // }

  // handleRouteChange = (props) => {
  //   const activeRoute = props.location.pathname
  //
  //   const pathExist = this.props.menu
  //     .some(m => m.link === activeRoute)
  //
  //   if (pathExist) {
  //     this.setState({ activeRoute })
  //   } else {
  //     this.setState({ activeRoute: '/exchange' })
  //   }
  // }
  //
  // componentDidMount = () => {
  //   this.handleRouteChange(this.props)
  // }
  //
  // componentWillReceiveProps = (nextProps) => {
  //   if (nextProps.location.pathname === this.state.activeRoute) {
  //     return
  //   }
  //
  //   this.handleRouteChange(nextProps)
  // }

  handleScrollToTopClick = (link) => {
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


    console.log('menu', menu)

    return (
      <div styleName="nav">
        <Fragment>
          {
            menu
              .filter(i => i.isDesktop !== false)
              .map(({ title, link, exact }) => (
                <NavLink
                  onClick={this.handleScrollToTopClick}
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
              <a href={links.test} styleName="link" target="_blank" rel="noreferrer noopener">
                <FormattedMessage id="Nav88" defaultMessage="Testnet" />
              </a>
            )
          }
        </Fragment>
      </div>
    )
  }
}

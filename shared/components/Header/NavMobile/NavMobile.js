import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import { NavLink } from 'react-router-dom'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './NavMobile.scss'


@CSSModules(styles)
export default class NavMobile extends Component {

  static propTypes = {
    menu: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      isOpened: false,
    }
  }

  handleToggle = () => {
    this.setState({
      isOpened: !this.state.isOpened,
    })
  }

  render() {
    const {
      props: {
        menu,
      },
      state: {
        isOpened,
      },
    } = this

    return (
      <div styleName="navMobile">
        <button className={styles.hamburger} type="button" onClick={this.handleToggle}>
          <span className={styles.hamburgerBox}>
            <span className={classnames(styles.hamburgerInner, isOpened && styles.hamburgerInnerActive)} />
          </span>
        </button>
        {
          isOpened && (
            <div styleName="navMenuContent">
              {
                menu
                  .filter(i => i.isMobile !== false)
                  .map(({ title, link, exact }) => (
                    <NavLink
                      exact={exact}
                      key={title}
                      styleName="linkMobile"
                      to={link}
                      activeClassName={styles.active}
                      onClick={this.handleToggle}
                    >
                      {title}
                    </NavLink>
                  ))
              }
              {
                process.env.MAINNET && (
                  <a styleName="linkMobile" target="_blank" rel="noreferrer noopener" href={links.testnet}> Testnet</a>
                )
              }
            </div>
          )
        }
      </div>
    )
  }
}

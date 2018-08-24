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
    const { props: { menu }, state: { isOpened } } = this

    return (
      <div styleName="navbar">
        {
          menu
            .filter(i => i.isMobile !== false)
            .map(({ title, link, exact }) => (
              <NavLink
                exact={exact}
                key={title}
                to={link}
                activeClassName={styles.active}
                onClick={this.handleToggle}
              >
                {title}
              </NavLink>
            ))
        }
      </div>
    )
  }
}

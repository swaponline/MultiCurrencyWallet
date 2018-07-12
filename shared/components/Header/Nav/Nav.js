import React, { Component } from 'react'

import { NavLink } from 'react-router-dom'
import { links } from 'helpers'
import CSSModules from 'react-css-modules'

import styles from './Nav.scss'


const nav = [
  { title: 'Orders', link: links.home },
  { title: 'Wallet', link: links.wallet },
  { title: 'History', link: links.history },
]

@CSSModules(styles)
export default class Nav extends Component {

  handleScrollTo = (scrollDuration) => {
    const scrollStep = -window.scrollY / (scrollDuration / 15)
    const scrollInterval = setInterval(() => {
      window.scrollY !== 0 ? window.scrollBy(0, scrollStep) : clearInterval(scrollInterval)
    }, 15)
  }

  render() {
    return (
      <div styleName="nav">
        {
          nav.map(({ title, link }) => (
            <NavLink
              onClick={() => this.handleScrollTo(500)}
              exact
              key={title}
              styleName="link"
              to={link}
              activeClassName={styles.active}
            >
              {title}
            </NavLink>
          ))
        }
      </div>
    )
  }
}

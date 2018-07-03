import React from 'react'

import { NavLink } from 'react-router-dom'
import { links } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './Nav.scss'


const nav = [
  { title: 'Orders', link: links.home },
  { title: 'Balances', link: links.balance },
  { title: 'History', link: links.history },
]

const Nav = () => (
  <div styleName="nav">
    {
      nav.map(({ title, link }) => (
        <NavLink
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

export default cssModules(Nav, styles)

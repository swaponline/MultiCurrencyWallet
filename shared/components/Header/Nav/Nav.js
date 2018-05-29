import React from 'react'
import { NavLink } from 'react-router-dom'
import { links } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './Nav.scss'

import actions from 'redux/actions'


const nav = [
  { title: 'Orders', link: links.home },
  { title: 'Balances', link: links.balance },
  { title: 'History', link: links.history },
]

if (process.env.TESTNET) {
  nav.push({ title: 'Get demo money', onClick: () => actions.user.getDemoMoney() })
}

const Nav = () => (
  <div styleName="nav">
    {
      nav.map(({ title, link, onClick }) => (
        link ? (
          <NavLink
            exact
            key={title}
            styleName="link"
            to={link}
            activeClassName={styles.active}
          >
            {title}
          </NavLink>
        ) : (
          <div
            key={title}
            styleName="link"
            onClick={onClick}
          >
            {title}
          </div>
        )
      ))
    }
  </div>
)

export default cssModules(Nav, styles)

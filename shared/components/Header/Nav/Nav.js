import React from 'react'
import { NavLink } from 'react-router-dom'

import cssModules from 'react-css-modules'
import styles from './Nav.scss'


const nav = [
  { title: 'All', link: '/' },
  { title: 'Balances', link: '/balance' },
  { title: 'History', link: '/history' },
  { title: 'Get demo money', onClick: () => { /* get demo money */ } },
]

const Nav = () => (
  <div styleName="nav">
    {
      nav.map(({ title, link, onClick }) => (
        link ? (
          <NavLink
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

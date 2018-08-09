import React from 'react'

import { NavLink } from 'react-router-dom'
import { links } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './NavMobile.scss'


const nav = [
  { title: 'Wallet',    link: links.home,     exact: true },
  { title: 'Exchange',    link: links.exchange    },
  { title: 'History',   link: links.history   },
]

const NavMobile = () => (
  <div styleName="navMobile" >
    {
      nav.map(({ title, link, exact }) => (
        <NavLink
          exact={exact}
          key={title}
          styleName="linkMobile"
          to={link}
          activeClassName={styles.active}
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

export default cssModules(NavMobile, styles, { allowMultiple: true })

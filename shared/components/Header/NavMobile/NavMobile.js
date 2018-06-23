import React from 'react'
import actions from 'redux/actions'

import { NavLink } from 'react-router-dom'
import { links } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './NavMobile.scss'


const nav = [
  { title: 'Orders', link: links.home },
  { title: 'Balances', link: links.balance },
  { title: 'History', link: links.history },
]

const NavMobile = ({ view }) => (
  <div styleName={view ? 'nav' : 'nav hide'} >
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
    {
      process.env.TESTNET && <div
        key="Get demo money"
        styleName="button"
        onClick={() => actions.user.getDemoMoney()}
      >
        Get demo money
      </div>
    }
  </div>
)

export default cssModules(NavMobile, styles, { allowMultiple: true })

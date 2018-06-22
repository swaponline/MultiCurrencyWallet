import React from 'react'
import actions from 'redux/actions'

import { NavLink } from 'react-router-dom'
import { links } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './Nav.scss'


const nav = [
  { title: 'Orders', link: links.home },
  { title: 'Balances', link: links.balance },
  { title: 'History', link: links.history },
]

const style = {
  'padding': '0 16px',
  'height': '56px',
  'cursor': 'pointer',
  'marginLeft': '20px',
  'lineHeight': '56px',
  'textTransform': 'uppercase',
  'textAlign': 'center',
  'fontSize': '16px',
  'borderRadius': '6px',
  'display': 'inline-block',
  'backgroundColor': '#E72BB3',
  'color': '#ffffff',
}

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
    {
      process.env.TESTNET && <div
        key="Get demo money"
        style={style}
        onClick={() => actions.user.getDemoMoney()}
      >
        Get demo money
      </div>
    }
  </div>
)

export default cssModules(Nav, styles)

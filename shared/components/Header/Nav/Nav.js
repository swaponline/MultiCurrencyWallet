import React, { Component, Fragment } from 'react'

import { NavLink } from 'react-router-dom'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './Nav.scss'


const nav = [
  { title: 'Wallet',    link: links.home,     exact: true },
  { title: 'Orders',    link: links.orders    },
  { title: 'History',   link: links.history   },
  { title: 'Affiliate', link: links.affiliate },
  { title: 'Listing',   link: links.listing   },
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
        <Fragment>
          {
            nav.map(({ title, link, exact }) => (
              <NavLink
                onClick={() => this.handleScrollTo(500)}
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
              <a href={links.test} styleName="link" target="_blank" rel="noreferrer noopener" >Testnet</a>
            )
          }
        </Fragment>
      </div>
    )
  }
}

import React, { Component } from 'react'

import { NavLink } from 'react-router-dom'
import { links } from 'helpers'
import CSSModules from 'react-css-modules'

import cssModules from 'react-css-modules'
import styles from './Nav.scss'


const nav = [
  { title: 'Orders', link: links.home },
  { title: 'Balances', link: links.balance },
  { title: 'History', link: links.history },
]

@CSSModules(styles)

export default class Nav extends Component {

  handleScrollTo = () => {

    function scrollToTop(scrollDuration) {
        var scrollStep = -window.scrollY / (scrollDuration / 15),
            scrollInterval = setInterval(function(){
            if ( window.scrollY != 0 ) {
                window.scrollBy( 0, scrollStep );
            }
            else clearInterval(scrollInterval); 
        },15);
    }
    scrollToTop(300);
  }

  render() {
    return (
      <div styleName="nav">
        {
          nav.map(({ title, link }) => (
            <NavLink
              onClick={this.handleScrollTo}
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

//export default Nav

//export default cssModules(Nav, styles)

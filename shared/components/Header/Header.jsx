import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Header.scss'

import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import Logo from 'components/Logo/Logo'
import Nav from './Nav/Nav'
import User from './User/User'


function Header() {
  return (
    <div styleName="header">
      <WidthContainer styleName="container">
        <Logo withLink />
        <Nav />
        <User />
      </WidthContainer>
    </div>
  )
}

export default CSSModules(Header, styles)


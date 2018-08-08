import React, { Component } from 'react'

import CSSModules from 'react-css-modules'
import styles from './Header.scss'

import Nav from './Nav/Nav'
import User from './User/User'
import NavMobile from './NavMobile/NavMobile'
import Logo from 'components/Logo/Logo'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'


const Header = ({ history }) => (
  <div styleName="header">
    <WidthContainer styleName="container">
      <Logo withLink />
      <NavMobile />
      <Nav />
      <User history={history} />
    </WidthContainer>
  </div>
)

export default CSSModules(Header, styles)

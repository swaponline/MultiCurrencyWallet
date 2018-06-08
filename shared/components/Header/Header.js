import React, { Component } from 'react'
import { createSwapApp } from 'instances/swap'

import CSSModules from 'react-css-modules'
import styles from './Header.scss'

import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import Logo from 'components/Logo/Logo'
import Nav from './Nav/Nav'
import User from './User/User'


@CSSModules(styles)
export default class Header extends Component {

  componentWillMount() {
    createSwapApp()
  }

  render() {
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
}

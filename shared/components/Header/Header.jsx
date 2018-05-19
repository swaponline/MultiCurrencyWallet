import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Header.scss'

import User from '../User/User'
import Toolbar from '../Toolbar/Toolbar'

function Header() {
  return (
    <div styleName="header">
      <div styleName="container" >
        <Toolbar />
        <User />
      </div>
    </div>
  )
}

export default CSSModules(Header, styles)


import React from 'react'

import cssModules from 'react-css-modules'
import styles from './MenuIcon.scss'

import Icon from './images/menu.svg'


const MenuIcon = ({ onClick }) => (
  <div styleName="menu" onClick={onClick} >
    <img src={Icon} styleName="menuImg" alt="" />
  </div>
)

export default cssModules(MenuIcon, styles)

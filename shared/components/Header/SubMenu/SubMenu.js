import React from 'react'
import PropTypes from 'prop-types'

import { FormattedMessage } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './SubMenu.scss'


const SubMenu = ({ className }) => (
  <ul styleName="submenu">
    <li styleName="submenu-item ">
      <a>Exchange</a>
    </li>
    <li styleName="submenu-item ">
      <a>Wallet</a>
    </li>
    <li styleName="submenu-item ">
      <a>Widget</a>
    </li>
    <li styleName="submenu-item ">
      <a>Chrome extantion</a>
    </li>
    <li styleName="submenu-item ">
      <a>Bank dashboard</a>
    </li>
  </ul>
)

export default CSSModules(SubMenu, styles)

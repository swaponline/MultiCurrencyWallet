import React from 'react'
import { NavLink } from 'react-router-dom'

import cssModules from 'react-css-modules'
import styles from './Logo.scss'

import logoImage from './images/logo.svg'


const Logo = () => (
  <NavLink styleName="logo" to="/">
    <img src={logoImage} alt="swap.online logo" />
  </NavLink>
)

export default cssModules(Logo, styles)

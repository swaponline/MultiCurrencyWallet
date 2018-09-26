import React from 'react'
import { NavLink } from 'react-router-dom'

import cssModules from 'react-css-modules'
import styles from './Href.scss'


const Href = ({ children, to, redirect, tab, rel }) => {
  if (to) {
    return (
      <NavLink styleName="link">{children}</NavLink>
    )
  }

  return (
    <a styleName="link" href={redirect || tab} target={tab ? '_blank' : null} rel={rel || null}>
      {children}
    </a>
  )
}

export default cssModules(Href, styles)

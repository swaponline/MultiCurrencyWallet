import React from 'react'
import { NavLink } from 'react-router-dom'

import cssModules from 'react-css-modules'
import styles from './Logo.scss'

import logoImage from './images/logo.svg'
import coloredLogoImage from './images/logo-colored.svg'


const Logo = ({ colored, withLink }) => {
  const imgNode = React.createElement('img', {
    styleName: !withLink && 'logo',
    src: colored ? coloredLogoImage : logoImage,
    alt: 'swap.online logo',
  })

  if (withLink) {
    return (
      <NavLink styleName="logo" to="/">
        {imgNode}
      </NavLink>
    )
  }

  return imgNode
}

export default cssModules(Logo, styles)

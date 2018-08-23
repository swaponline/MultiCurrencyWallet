import React from 'react'
import { Link } from 'react-router-dom'
import { links } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './Logo.scss'

import logoImage from './images/logo.svg'
import coloredLogoImage from './images/logo-colored.svg'


const Logo = ({ colored, withLink, mobile }) => {
  const imgNode = React.createElement('img', {
    styleName: !withLink && 'logo',
    src: colored ? coloredLogoImage : logoImage,
    alt: 'swap.online logo',
  })

  if (withLink) {
    return (
      <Link styleName={mobile ? 'mobile' : 'logo'} to={links.home}>
        {imgNode}
      </Link>
    )
  }

  return imgNode
}

export default cssModules(Logo, styles)

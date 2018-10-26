import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import { Link } from 'react-router-dom'
import { links } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './Logo.scss'

import logoImage from './images/logo.svg'
import coloredLogoImage from './images/logo-colored.svg'
import ReactTooltip from 'react-tooltip'


const Logo = ({ colored, withLink, mobile }) => {

  const imgNode = React.createElement('img', {
    styleName: !withLink && 'logo',
    src: colored ? coloredLogoImage : logoImage,
    alt: 'swap.online logo',
  })

  if (withLink) {
    return (
      <Fragment>
        <Link styleName={mobile ? 'mobile' : 'logo'} data-tip data-for="logo" to={links.home}>
          {imgNode}
          <ReactTooltip id="logo" type="light" effect="solid">
            <span>Go Home</span>
          </ReactTooltip>
        </Link>
      </Fragment>
    )
  }

  return imgNode
}

Logo.propTypes = {
  colored: PropTypes.string,
  withLink: PropTypes.bool,
  mobile: PropTypes.bool,
}

export default cssModules(Logo, styles)

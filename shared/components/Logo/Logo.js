import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { Link } from 'react-router-dom'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './Logo.scss'

import logoImage from './images/logo.svg'
import coloredLogoImage from './images/logo-colored.svg'
import { injectIntl } from 'react-intl'


@injectIntl
@CSSModules(styles, Logo )
export default class Logo extends Component {

  static propTypes = {
    colored: PropTypes.string,
    withLink: PropTypes.bool,
    mobile: PropTypes.bool,
  }

  render () {
    const { colored, withLink, mobile, intl: { locale } } = this.props

    const imgNode = React.createElement('img', {
      styleName: !withLink && 'logo',
      src: colored ? coloredLogoImage : logoImage,
      alt: 'swap.online logo',
    })

    return (
      <Fragment>
        {withLink ?
          (<Link styleName={mobile ? 'mobile' : 'logo'} data-tip data-for="logo" to={`/${locale}${links.home}`}>
          {imgNode}
          </Link>
        ) : (
      <div>{imgNode}</div>
        )
        }
      </Fragment>
    )
  }
}

import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { Link, withRouter } from 'react-router-dom'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './Logo.scss'

import logoImage from './images/logo.svg'
import coloredLogoImage from './images/logo-blue.svg'
import { injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'


@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class Logo extends Component {

  static propTypes = {
    isColored: PropTypes.bool,
    withLink: PropTypes.bool,
    mobile: PropTypes.bool,
  }

  render() {
    const { isColored, withLink, mobile, intl: { locale }, isExchange } = this.props

    const imgNode = React.createElement('img', {
      styleName: !withLink && 'logo',
      src: isColored ? coloredLogoImage : logoImage,
      alt: 'swap.online logo',
    })

    return (
      <Fragment>
        {withLink ?
          (
            <Link styleName={`${mobile ? 'mobile' : 'logo'}`} data-tip data-for="logo" to={localisedUrl(locale, links.home)}>
              {imgNode}
            </Link>
          ) : (<div styleName={`${!isExchange && 'whiteFill'}`} >{imgNode}</div>)
        }
      </Fragment>
    )
  }
}

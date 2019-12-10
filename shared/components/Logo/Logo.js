import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { Link, withRouter } from 'react-router-dom'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './Logo.scss'

import logoImage from './images/logoAtomic.png'
import { injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'


@injectIntl
@CSSModules(styles, Logo)
export default class Logo extends Component {

  static propTypes = {
    isColored: PropTypes.bool,
    withLink: PropTypes.bool,
    mobile: PropTypes.bool,
  }

  render() {
    const { isColored, withLink, mobile, intl: { locale } } = this.props

    const imgNode = React.createElement('img', {
      styleName: !withLink && 'logo',
      src: logoImage,
      alt: 'Atomicswapwallet.io logo',
      style: { width: "30px" }
    })

    return (
      <Fragment>
        {withLink ?
          (
            <a styleName={mobile ? 'mobile' : 'logo'} data-tip data-for="logo" href="/">
              {imgNode}
            </a>
          ) : (<div>{imgNode}</div>)
        }
      </Fragment>
    )
  }
}

import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { Link, withRouter } from 'react-router-dom'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'

import { injectIntl } from 'react-intl'


@injectIntl
export default class SwitchLang extends Component {


  render() {
    const { intl: { locale }, className, children, onClick, href  } = this.props

    return (
        <a className={className} style={{ color: 'white' }} onClick={onClick} href={href}>{children}</a>
    )
  }

}

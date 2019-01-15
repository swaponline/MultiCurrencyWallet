import React, { Component } from 'react'

import cssModules from 'react-css-modules'
import styles from './ErrorPageNoSSL.scss'

import { FormattedMessage, injectIntl } from 'react-intl'


@cssModules(styles)
export default class ErrorPageNoSSL extends Component {
  render () {
    return (
      <div styleName="page">
        <h3 styleName="header">
          "Error: This page does not support secure connection (https)"
        </h3>
      </div>
    )
  }
}

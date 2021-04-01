import React, { Component } from 'react'

import cssModules from 'react-css-modules'
import styles from './ErrorPageNoSSL.scss'

import { FormattedMessage, injectIntl } from 'react-intl'


@cssModules(styles)
export default class ErrorPageNoSSL extends Component<any, any> {
  render() {
    return (
      <div styleName="page">
        <h3 styleName="header">
          Error: This page should be opened in a secure connection (with &#34;https&#34; in the beginning)
        </h3>
        <h3>
            <strong>
              <a href={`https://${document.location.host}${document.location.pathname}${document.location.hash}`}>
                CLICK HERE
              </a>
            </strong>
        </h3>
      </div>
    )
  }
}

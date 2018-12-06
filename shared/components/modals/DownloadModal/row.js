import React, { Component } from 'react'

import cssModules from 'react-css-modules'
import styles from './DownloadModal.scss'

import { FormattedMessage } from 'react-intl'


@cssModules(styles)
export default class RowDownload extends Component {
  render() {
    const { id, msg, item } = this.props

    return (
      <p styleName="content">
        {item}
        <FormattedMessage  id={id} defaultMessage={msg} />
      </p>
    )
  }
}

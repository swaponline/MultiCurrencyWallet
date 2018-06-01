import React, { Component } from 'react'

import cssModules from 'react-css-modules'
import styles from './RequestButton.scss'


@cssModules(styles, { allowMultiple: true })
export default class RequestButton extends Component {

  render() {
    const { sendRequest } = this.props

    return (
      <div styleName="button" onClick={sendRequest} />
    )
  }
}

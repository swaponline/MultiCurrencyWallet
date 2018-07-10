import React, { Component } from 'react'

import cssModules from 'react-css-modules'
import styles from './RemoveButton.scss'


@cssModules(styles, { allowMultiple: true })
export default class RemoveButton extends Component {

  render() {
    const { removeOrder } = this.props

    return (
      <div styleName="button" onClick={removeOrder} />
    )
  }
}

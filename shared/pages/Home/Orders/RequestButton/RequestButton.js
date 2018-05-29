import React, { Component } from 'react'

import cssModules from 'react-css-modules'
import styles from './RequestButton.scss'


@cssModules(styles, { allowMultiple: true })
export default class RequestButton extends Component {

  handleClick = () => {
    alert('This functionality will be available soon! :)')
  }

  render() {

    return (
      <div styleName="button" onClick={this.handleClick} />
    )
  }
}

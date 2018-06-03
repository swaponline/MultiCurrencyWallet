import React, { Component } from 'react'

import cssModules from 'react-css-modules'
import styles from './Requests.scss'

import Notification from 'components/notification/Notification/Notification'


@cssModules(styles)
export default class SwapRequests extends Component {
  render() {
    const { name, data: { amount, currency, address } } = this.props

    return (
      <Notification name={name} >
        <span styleName="value">{amount} {currency}</span> were successfully transferred to {address}!
      </Notification>
    )
  }
}

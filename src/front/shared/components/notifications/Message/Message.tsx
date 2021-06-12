import React, { Component } from 'react'

import cssModules from 'react-css-modules'
import styles from './Message.scss'

import Notification from 'components/notification/Notification/Notification'


@cssModules(styles)
export default class Message extends Component<any, any> {
  render() {
    const { name, data: { message, timeout, type } } = this.props

    return (
      <Notification name={name} timeout={timeout} type={type}>
        <span styleName="value">{message}</span>
      </Notification>
    )
  }
}

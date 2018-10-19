import React from 'react'

import cssModules from 'react-css-modules'
import styles from './ErrorNotification.scss'

import Notification from 'components/notification/Notification/Notification'


const ErrorNotification = ({ data, name }) => (
  <Notification name={name}>
    <h3 styleName="value">Oops, looks like something went wrong!</h3>
    <p styleName="value">Error: {data.error}</p>
  </Notification>
)

export default cssModules(ErrorNotification, styles, { allowMultiple: true })

import React from 'react'

import cssModules from 'react-css-modules'
import styles from './ErrorNotification.scss'

import Notification from 'components/notification/Notification/Notification'


 const ErrorNotification = ({ data, name }) => (
  <Notification name={name} styleName={data.center ? 'warning-norification-container' : 'error-notification-container'}>
    <h3 styleName="error-notification-heading ">Oops, looks like something went wrong!</h3>
    <p styleName="error-notification-text">Error: {data.error}</p>
  </Notification>
)

 export default cssModules(ErrorNotification, styles, { allowMultiple: true })

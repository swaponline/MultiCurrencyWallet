import React from 'react'
import cssModules from 'react-css-modules'

import styles from './ErrorNotification.scss'


const ErrorNotification = ({ error, hideErrorNotification }) => (
  <div styleName="error-notification-container">
    <span styleName="error-notification-close" onClick={hideErrorNotification} >&times;</span>
    <h3 styleName="error-notification-heading">Oops, looks like something went wrong!</h3>
    <p styleName="error-notification-text">Error: {error}</p>
  </div>
)

export default cssModules(ErrorNotification, styles, { allowMultiple: true })

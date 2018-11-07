import React from 'react'

import cssModules from 'react-css-modules'
import styles from './ErrorNotification.scss'

import Notification from 'components/notification/Notification/Notification'
import { FormattedMessage } from 'react-intl'


const ErrorNotification = ({ data, name }) => (
  <Notification soundPlay={false} name={name} styleName={'righttop'}>
    <FormattedMessage id="ErrorNotification12" defaultMessage="Oops, looks like something went wrong!">
      {message => <h3 styleName="error-notification-heading ">{message}</h3>}
    </FormattedMessage>
    <FormattedMessage id="ErrorNotification15" defaultMessage="Error:">
      {message => <p styleName="error-notification-text">{message}{data.error}</p>}
    </FormattedMessage>
  </Notification>
)

export default cssModules(ErrorNotification, styles, { allowMultiple: true })

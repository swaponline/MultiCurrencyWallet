import React from 'react'

import cssModules from 'react-css-modules'

import Notification from 'components/notification/Notification/Notification'
import { FormattedMessage } from 'react-intl'


const ErrorNotification = ({ data, name }) => (
  <Notification soundPlay={false} name={name} type={name}>
    <FormattedMessage id="ErrorNotification12" defaultMessage="Oops, looks like something went wrong!">
      {message => <h3>{message}</h3>}
    </FormattedMessage>
    <FormattedMessage id="ErrorNotification15" defaultMessage="Error: ">
      {message => <p>{message}{data.error}</p>}
    </FormattedMessage>
  </Notification>
)

export default cssModules(ErrorNotification, { allowMultiple: true })

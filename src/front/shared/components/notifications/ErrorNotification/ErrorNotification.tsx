import Notification from 'components/notification/Notification/Notification'
import { FormattedMessage } from 'react-intl'

const ErrorNotification = ({ data, name }) => (
  <Notification soundPlay={false} name={name} type={name}>
    <h3>
      <FormattedMessage id="ErrorNotification12" defaultMessage="Oops, looks like something went wrong!" />
    </h3>
    <p>
      <FormattedMessage id="ErrorNotification151" defaultMessage="Error: {error}" values={{ error: `${data.error}` }} />
    </p>
  </Notification>
)

export default ErrorNotification

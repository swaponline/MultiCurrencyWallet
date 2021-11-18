import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import Notification from 'components/notification/Notification/Notification'

type ComponentProps = {
  data: {
    link: string
    completed?: boolean
    failed?: boolean
  }
  name: string
}

function Transaction(props: ComponentProps) {
  const { name, data } = props

  return (
    <Notification
      soundPlay={true}
      timeout={15_000}
      name={name}
      type={data.failed ? 'ErrorNotification' : ''}
    >
      <h3>
        {data.failed ? (
          <FormattedMessage
            id="failedTransaction"
            defaultMessage="Failed transaction"
          />
        ) : data.completed ? (
          <FormattedMessage
            id="transactionIsCompleted"
            defaultMessage="The transaction is completed"
          />
        ) : (
          <FormattedMessage id="transacton" defaultMessage="Transaction" />
        )}
      </h3>
      <a href={data.link} target="_blank" styleName="transactionLink">
        <FormattedMessage id="viewTransaction" defaultMessage="View the transaction" />
      </a>
    </Notification>
  )
}

export default CSSModules(Transaction, styles, { allowMultiple: true })

import React from 'react'

import Row from '../Row/Row'
import Value from '../Value/Value'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'


const title = defineMessages({
  Fee: {
    id: 'fee9',
    defaultMessage: `Miner fee`,
  },
})

const Fee = ({ amount, currency, intl }) => (
  <Row title={intl.formatMessage(title.Fee)}>
    <Value value={amount} currency={currency} />
  </Row>
)

export default injectIntl(Fee)

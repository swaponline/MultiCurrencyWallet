import React from 'react'

import Row from '../Row/Row'
import Value from '../Value/Value'
import { FormattedMessage } from 'react-intl'


const title = [
  <FormattedMessage id="fee9" defaultMessage="Miner fee" />
]

const Fee = ({ amount, currency }) => (
  <Row title={title}>
    <Value value={amount} currency={currency} />
  </Row>
)

export default Fee

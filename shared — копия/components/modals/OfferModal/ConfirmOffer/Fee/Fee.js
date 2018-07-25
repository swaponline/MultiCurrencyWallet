import React from 'react'

import Row from '../Row/Row'
import Value from '../Value/Value'


const Fee = ({ amount, currency }) => (
  <Row title="Miner fee">
    <Value value={amount} currency={currency} />
  </Row>
)

export default Fee


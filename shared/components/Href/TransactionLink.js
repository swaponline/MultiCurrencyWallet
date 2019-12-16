import React from 'react'
import PropTypes from 'prop-types'

import Href from './Href'
import config from 'app-config'
import { FormattedMessage } from 'react-intl'


const setApi = (type, id) => {
  switch (type) {
    case 'BTC':
      return `${config.link.bitpay}/tx/${id}`

    case 'ETH':
      return `${config.link.etherscan}/tx/${id}`

    default:
      return `${id}`
  }
}


const TransactionLink = ({ type, id }) => (
  <div>
    <FormattedMessage id="transactionLink28" defaultMessage="Transaction: " />
    <strong>
      <Href tab={setApi(type, id)} rel="noopener noreferrer">{id}</Href>
    </strong>
  </div>
)

TransactionLink.propTypes = {
  type: PropTypes.string.isRequired, // BTC, ETH ...
  id: PropTypes.string.isRequired, // transaction id
}

export default TransactionLink

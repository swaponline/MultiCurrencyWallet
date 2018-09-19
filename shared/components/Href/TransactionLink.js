import React from 'react'

import Href from './Href'
import config from 'app-config'


const setApi = (type, link, id) => {
  switch (type) {
    case 'BTC':
      return `${config.link.bitpay}/tx/${id}`

    case 'ETH':
      return `${config.link.etherscan}/tx/${id}`

    case 'EOS':
      return `${config.link.eos}/tx/${id}`
  }
}


const TransactionLink = ({ type, id, link = '#' }) => (
  <div>
    Transaction: <strong><Href tab={setApi(type, link, id)} rel="noopener noreferrer">{id}</Href></strong>
  </div>
)

export default TransactionLink

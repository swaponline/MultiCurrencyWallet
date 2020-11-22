import React, { Fragment } from 'react'
import config from 'app-config'

import Href from 'components/Href/Href'

const LinkTransaction = ({ type, children, hash }) => (
  <Fragment>
    {type.toLowerCase() === 'eth' && (
      <Href tab={`${config.link.etherscan}/tx/${hash}`}>{children}</Href>
    )}
    {type.toLowerCase() === 'btc' && (
      <Href tab={`${config.link.bitpay}/tx/${hash}`}>{children}</Href>
    )}
    {/* type.toLowerCase() === 'usdt' && <Href tab={`${config.link.usdt}/tx/${hash}`} >{children}</Href> */}
    {Object.keys(config.erc20).includes(type.toLowerCase()) && (
      <Href tab={`${config.link.etherscan}/tx/${hash}`}>{children}</Href>
    )}
  </Fragment>
)

export default LinkTransaction

import React, { Fragment } from 'react'
import config from 'app-config'
import Href from 'components/Href/Href'


const erc20Link = (type, hash, children) => Object.keys(config.erc20)
  .map(key => type.toLowerCase() === key
    && <Href tab={`${config.link.etherscan}/tx/${hash}`}>{children}</Href>
  )

const LinkTransaction = ({ type, children, hash }) => (
  <Fragment>
    { type.toLowerCase() === 'eth' && <Href tab={`${config.link.etherscan}/tx/${hash}`} >{children}</Href> }
    { type.toLowerCase() === 'btc' && <Href tab={`${config.link.bitpay}/tx/${hash}`} >{children}</Href> }
    { type.toLowerCase() === 'ltc' && <Href tab={`${config.link.ltc}/tx/${hash}`} >{children}</Href> }
    { erc20Link(type, hash, children) }
  </Fragment>
)

export default LinkTransaction

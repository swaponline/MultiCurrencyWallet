import React, { Fragment } from 'react'
import config from 'app-config'

import Href from 'components/Href/Href'


const LinkTransaction = ({ type, children, address }) => (
  <Fragment>
    { type.toLowerCase() === 'eth' && <Href tab={`${config.link.etherscan}/address/${address}`} >{children}</Href> }
    { type.toLowerCase() === 'btc' && <Href tab={`${config.link.bitpay}/address/${address}`} >{children}</Href> }
    { type.toLowerCase() === 'noxon' && <Href tab={`${config.link.etherscan}/token/${config.services.web3.noxonToken}?a=${address}`} >{children}</Href> }
  </Fragment>
)


export default LinkTransaction

import React, { Fragment } from 'react'
import config from 'app-config'

import Href from 'components/Href/Href'


const LinkTransaction = ({ type, children, address }) => (
  <Fragment>
    { type.toLowerCase() === 'eth' && <Href tab={`https://rinkeby.etherscan.io/address/${address}`} >{children}</Href> }
    { type.toLowerCase() === 'btc' && <Href tab={`https://blockchain.info/address/${address}`} >{children}</Href> }
    { type.toLowerCase() === 'noxon' && <Href tab={`https://rinkeby.etherscan.io/token/${config.services.web3.noxonToken}?a=${address}`} >{children}</Href> }
  </Fragment>
)


export default LinkTransaction

import React, { Fragment } from 'react'
import config from 'app-config'

import Href from 'components/Href/Href'


const erc20LinkAcount = (type, children, address, contractAddress) => Object.keys(config.erc20)
  .map(key => type.toLowerCase() === key
    && <Href key={key} tab={`${config.link.etherscan}/token/${contractAddress}?a=${address}`} >{children}</Href>
  )

const LinkAccount = ({ type, children, address, contractAddress, onClick }) => (
  <Fragment>
    {onClick ? (
      <a styleName="link" onClick={onClick}>{children}</a>
    ) : (
        <Fragment>
          {type.toLowerCase() === 'eth' && <Href tab={`${config.link.etherscan}/address/${address}`} >{children}</Href>}
          {(type.toLowerCase() === 'btc' || type.toLowerCase() === 'btc (sms-protected)' || type.toLowerCase() === 'btc (multisig)')
            && <Href tab={`${config.link.bitpay}/address/${address}`} >{children}</Href>}
          { /* type.toLowerCase() === 'usdt' && <Href tab={`${config.link.omniexplorer}/address/${address}`} >{children}</Href> */}
          {erc20LinkAcount(type, children, address, contractAddress)}
          {type.toLowerCase() === 'qtum' && <Href tab={`${config.link.qtum}/address/${address}`} >{children}</Href>}
          { /* type.toLowerCase() === 'xlm' && <Href tab={`${config.link.xlm}/address/${address}`}>{children}</Href> */}
        </Fragment>
      )}
  </Fragment>
)


export default LinkAccount

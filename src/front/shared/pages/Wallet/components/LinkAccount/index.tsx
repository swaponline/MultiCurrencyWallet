import React from 'react'
import config from 'app-config'

import Href from 'components/Href/Href'


const erc20LinkAcount = (type, children, address, contractAddress) => Object.keys(config.erc20)
  .map(key => type.toLowerCase() === key
    //@ts-ignore
    && <Href key={key} tab={`${config.link.etherscan}/token/${contractAddress}?a=${address}`} >{children}</Href>
  )

const LinkAccount = ({ type, children, address, contractAddress, onClick }) => (
  <>
    {onClick ? (
      <a onClick={onClick}>{children}</a>
    ) : (
      <>
        {type.toLowerCase() === 'eth' &&
          //@ts-ignore
          <Href tab={`${config.link.etherscan}/address/${address}`}>{children}</Href>
        }
        {type.toLowerCase() === 'ghost' &&
        //@ts-ignore
          <Href tab={`${config.link.ghostscan}/address/${address}`}>{children}</Href>
        }
        {type.toLowerCase() === 'next' &&
          //@ts-ignore
          <Href tab={`${config.link.nextExplorer}/#/address/${address}`}>{children}</Href>
        }
        {(type.toLowerCase() === 'btc' || type.toLowerCase() === 'btc (pin-protected)' || type.toLowerCase() === 'btc (sms-protected)' || type.toLowerCase() === 'btc (multisig)')
          &&
          //@ts-ignore
          <Href tab={`${config.link.bitpay}/address/${address}`}>{children}</Href>
        }
        {erc20LinkAcount(type, children, address, contractAddress)}
      </>
    )}
  </>
)


export default LinkAccount

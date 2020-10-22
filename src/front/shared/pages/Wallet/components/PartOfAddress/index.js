import React from 'react'

import Address, { AddressFormat } from 'components/ui/Address/Address'
import LinkAccount from '../LinkAccount'


export default ({ currency, contractAddress, address, onClick, withoutLink, style }) => {

  const styleOverwrited = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'rgb(142, 154, 163)',
  }

  return (
    <div>
      {!withoutLink ? (
        <LinkAccount type={currency} contractAddress={contractAddress} address={address} onClick={onClick}>
          <Address
            address={address}
            format={AddressFormat.Short}
            style={{ ...style, ...styleOverwrited }}
          />
        </LinkAccount>
      ) : (
        <Address
          address={address}
          format={AddressFormat.Short}
          style={{ ...style, ...styleOverwrited }}
        />
      )}
    </div>
  )
}

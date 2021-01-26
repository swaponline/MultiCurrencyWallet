import React from 'react'

import Address from 'components/ui/Address/Address'
import { AddressFormat } from 'domain/address'
import LinkAccount from '../LinkAccount'

export default function PartOfAddress(props) {
  const { 
    style,
    currency, 
    contractAddress, 
    address, 
    onClick, 
    withoutLink
  } = props

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

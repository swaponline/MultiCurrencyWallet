import React from 'react'

import Address from 'components/ui/Address/Address'
import { AddressFormat } from 'domain/address'
import { LinkEndpoint } from '../Endpoints'

export default function PartOfAddress(props) {
  const { 
    style,
    currency, 
    contractAddress, 
    address, 
    withoutLink,
  } = props

  const styleOverwrited = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'rgb(142, 154, 163)',
  }

  const AddressElement = (
    <Address
      address={address}
      format={AddressFormat.Short}
      style={{ ...style, ...styleOverwrited }}
    />
  )

  return (
    <div>
      {!withoutLink ? (
        <LinkEndpoint symbol={currency} contractAddress={contractAddress} address={address}>
          {AddressElement}
        </LinkEndpoint>
      ) : AddressElement}
    </div>
  )
}

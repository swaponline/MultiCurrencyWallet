import React from 'react'

import Address from 'components/ui/Address/Address'
import { AddressFormat } from 'domain/address'
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
          {/*
          //@ts-ignore */}
          <Address
            address={address}
            format={AddressFormat.Short}
            style={{ ...style, ...styleOverwrited }}
          />
        </LinkAccount>
      ) : (
        //@ts-ignore
        <Address
          //@ts-ignore
          address={address}
          format={AddressFormat.Short}
          style={{ ...style, ...styleOverwrited }}
        />
      )}
    </div>
  )
}

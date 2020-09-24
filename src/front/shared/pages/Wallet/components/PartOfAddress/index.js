import React from 'react'
import LinkAccount from '../LinkAccount'


export default ({ currency, contractAddress, address, onClick, withoutLink }) => {
  const endOfAddress = address.substring(address.length - 4, address.length)
  const startOfAddress = address.substring(0, 2)
  /* eslint-disable */
  return (
    <div>
      {!withoutLink ? (
        <LinkAccount type={currency} contractAddress={contractAddress} address={address} onClick={onClick}>
          <span
            style={{
              fontSize: '12px',
              marginLeft: '10px',
              color: 'rgb(142, 154, 163)',
              marginTop: '1px',
              position: 'absolute',
              left: '46px',
              bottom: '4px',
            }}
          >
            {startOfAddress}
            &#183; &#183; &#183;
            {endOfAddress}
          </span>
        </LinkAccount>
      ) : (
        <span>
          {startOfAddress}
          &#183; &#183; &#183;
          {endOfAddress}
        </span>
      )}
    </div>
  )
  /* eslint-enable */
}

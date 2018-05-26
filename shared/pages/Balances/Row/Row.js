import React from 'react'

import Coin from 'components/Coin/Coin'
import WithdrawButton from 'components/controls/WithdrawButton/WithdrawButton'


const Row = ({ currency, balance, address }) => (
  <tr>
    <td>
      <Coin name={currency} size={40} />
    </td>
    <td>{currency.toUpperCase()}</td>
    <td>{balance}</td>
    <td>{address}</td>
    <td>
      <WithdrawButton text="Withdraw" data={{ currency, balance, address }} />
    </td>
  </tr>
)

export default Row

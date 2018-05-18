import React from 'react'
import PropTypes from 'prop-types'
import './Balances.scss'

import Wallet from './Wallet'

export default function Balance({ wallets, openModal, fetching }) {
  return (
    <tbody>
      { fetching  ?
        wallets.map((wallet, index) =>
          (<Wallet
            key={index}
            balance={wallet.balance}
            currency={wallet.currency}
            address={wallet.address}
            openModal={() => openModal('CARD', true, { wallet })}
          />)
        ) : <tr><td>Идет загрузка данных...</td></tr>
      }
    </tbody>
  )
}


Balance.propTypes = {
  wallets: PropTypes.array.isRequired,
  openModal: PropTypes.func.isRequired,
  fetching: PropTypes.bool.isRequired,
}


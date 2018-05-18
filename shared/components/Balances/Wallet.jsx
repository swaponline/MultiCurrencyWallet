import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Balances.scss'

import CoinBTC from './coin-1.svg'
import CoinETH from './coin-2.svg'
import Withdraw from '../controls/Withdraw/Withdraw'

function Wallet({ currency, balance, address, openModal }) {
  return (
    <tr>
      <td>
        <div styleName="table__coins">
          <span styleName="table__coin-left">
            { currency === 'eth' ? <img src={CoinETH} alt="" /> : <img src={CoinBTC} alt="" /> }
          </span>
        </div>
      </td>
      <td>
        <div styleName="table__name">{currency.toUpperCase()}</div>
      </td>
      <td>
        <div styleName="table__balance">{balance}</div>
      </td>
      <td>
        <div styleName="table__key">{address}</div>
      </td>
      <td>
        <Withdraw text="Withdraw" isOpen={openModal} />
      </td>
    </tr>
  )
}

Wallet.propTypes = {
  currency: PropTypes.string.isRequired,
  balance: PropTypes.number.isRequired,
  address: PropTypes.string.isRequired,
  openModal: PropTypes.func.isRequired,
}

export default CSSModules(Wallet, styles)

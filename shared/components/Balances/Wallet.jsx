import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Balances.scss'

import CoinBtc from './coin-1.svg'
import CoinEth from './coin-2.svg'
import CoinNoxon from './noxon.svg'
import Withdraw from '../controls/Withdraw/Withdraw'


function Wallet({ currency, balance, address, openModal }) {
  return (
    <tr>
      <td>
        <div styleName="table__coins">
          <span styleName="table__coin-left">
            { currency.toLowerCase() === 'eth' && <img src={CoinEth} alt="" /> }
            { currency.toLowerCase() === 'btc' && <img src={CoinBtc} alt="" /> }
            { currency.toLowerCase() === 'noxon' && <img src={CoinNoxon} alt="" /> }
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

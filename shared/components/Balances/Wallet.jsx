import React from 'react'
import PropTypes from 'prop-types'

import CoinBTC from './coin-1.svg'
import CoinETH from './coin-2.svg'
import Withdraw from '../controls/Withdraw/Withdraw'

const Wallet = ({ currency, balance, address }) => (
    <tr>
        <td>
            <div className="table__coins">
                <span className="table__coin-left">
                    { currency === 'eth' ? <img src={CoinETH} alt=""/> : <img src={CoinBTC} alt=""/> }
                </span>
            </div>
        </td>
        <td>
            <div className="table__name">{currency.toUpperCase()}</div>
        </td>
        <td>
            <div className="table__balance">{balance}</div>
        </td>
        <td>
            <div className="table__key">{address}</div>
        </td>
        <td>
            <Withdraw text="Withdraw" />
        </td>
    </tr>
)

Wallet.propTypes = {
    currency: PropTypes.string.isRequired,
    balance: PropTypes.number.isRequired,
    address: PropTypes.string.isRequired,
}

export default Wallet

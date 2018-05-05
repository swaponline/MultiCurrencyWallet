import React from 'react'
import PropTypes from 'prop-types'

// import Coin from './coin-2.svg'
import Withdraw from '../controls/Withdraw/Withdraw'

const Wallet = ({ coinImg, currency, balance, address }) => (
    <tr>
        <td>
            <div className="table__coins">
                <span className="table__coin-left">
                    <img src={coinImg} alt=""/>
                </span>
            </div>
        </td>
        <td>
            <div className="table__name">{currency}</div>
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

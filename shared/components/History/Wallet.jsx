import React from 'react'
import PropTypes from 'prop-types'
import './History.scss'

const Wallet = ({ type, value, address, date, currency, name, icon, }) =>  (
    <tr >
        <td>
            <div className="table__coin">
                <div className={'table__coin-img ' + icon}></div>
                <div className="table__coin-abbr">{currency}</div>
                <div className="table__coin-name">{name}</div>
            </div>
        </td>

        <td>
            <div className="table__status">
                <div className={type === 'in' ? 
                'table__status-stat table__status-stat_received' 
                    : 
                type === 'out' ? 
                'table__status-stat table__status-stat_sent' : 'table__status-stat '} >Sent</div>
                <div className="table__status-date">{date}</div>
                <div className="table__status-address">Address: <span className="table__status-address-hash">{address}</span></div>
            </div>
        </td>

        <td>
            <span href="#" className={type === 'in' ?
            'table__amount table__amount_received' 
                :
            type === 'out' ? 'table__amount table__amount_sent' : 'table__amount '}>{ value}</span>
        </td>
    </tr>
)

Wallet.propTypes = {
    icon: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired
    
}

export default Wallet

// table__coin-btc
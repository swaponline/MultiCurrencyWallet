import React from 'react'

import './History.scss'

const Wallet = ({ history, currency, name, icon }) =>  (
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
                <div className={history.type === 'in' ? 'table__status-stat table__status-stat_received' : history.type === 'out' ? 'table__status-stat table__status-stat_sent' : 'table__status-stat '} >Sent</div>
                <div className="table__status-date">{history.date.toString()}</div>
                <div className="table__status-address">Address: <span className="table__status-address-hash">{history.address}</span></div>
            </div>
        </td>

        <td>
            <span href="#" className={history.type === 'in' ? 'table__amount table__amount_received' : history.type === 'out' ? 'table__amount table__amount_sent' : 'table__amount '}>{history.value}</span>
        </td>
    </tr>
)

export default Wallet
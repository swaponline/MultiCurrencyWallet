import React from 'react'

import './History.scss'

const History = ({ history }) => (
    <tbody>
        { history.map((item, index) => 
        <tr key={index}>
            <td>
                <div className="table__coin">
                    <div className={item.currency === 'BTC' ? 'table__coin-img table__coin-btc' : 'table__coin-img table__coin-eth'}></div>
                    <div className="table__coin-abbr">{item.currency}</div>
                    <div className="table__coin-name">{item.currency === 'BTC' ? 'Bitcoin' : 'Ethereum'}</div>
                </div>
            </td>

            <td>
                <div className="table__status">
                    <div className={item.type === 'in' ? 'table__status-stat table__status-stat_received' : item.type === 'out' ? 'table__status-stat table__status-stat_sent' : 'table__status-stat '} >{item.status}</div>
                    <div className="table__status-date">{item.date}</div>
                    <div className="table__status-address">Address: <span className="table__status-address-hash">{item.address}</span></div>
                </div>
            </td>

            <td>
                <span href="#" className={item.type === 'in' ? 'table__amount table__amount_received' : item.type === 'out' ? 'table__amount table__amount_sent' : 'table__amount '}>{item.value}</span>
            </td>
        </tr>
        )}
    </tbody>
);

export default History
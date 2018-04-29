import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './BodyHistory.scss'

const coin = [
    {
        name: 'ETH',
        fullName: 'Ethereum',
        classCoin: 'table__coin-img table__coin-eth',
        status: 'Sent',
        classSent: true,
        date: 'December 13 2017 @12:11AM',
        address: '0x5ee7c14f62786add137fe729a88e870e8187b92d',
        amount: '0.00616362',
        classAmount: true
    },
    {
        name: 'BTC',
        fullName: 'Bitcoin',
        classCoin: 'table__coin-img table__coin-btc',
        status: 'Sent',
        classSent: false,
        date: 'December 14 2017 @12:11AM',
        address: '0x5ee7c14f62786add137fe729a88e870e8187b92d',
        amount: '0.00216362',
        classAmount: false
    }
]

const BodyHistory = () => (
    <tbody>
        { coin.map((item, index) => 
        <tr key={index}>
            <td>
                <div className="table__coin">
                    <div className={item.classCoin}></div>
                    <div className="table__coin-abbr">{item.name}</div>
                    <div className="table__coin-name">{item.fullName}</div>
                </div>
            </td>

            <td>
                <div className="table__status">
                    <div className={item.classSent ? 'table__status-stat table__status-stat_received' : 'table__status-stat table__status-stat_sent'} >{item.status}</div>
                    <div className="table__status-date">{item.date}</div>
                    <div className="table__status-address">Address: <span className="table__status-address-hash">{item.address}</span></div>
                </div>
            </td>

            <td>
                <span href="#" className={ item.classAmount ? 'table__amount table__amount_received' : 'table__amount table__amount_sent' }>{item.amount}</span>
            </td>
        </tr>
        )}
    </tbody>
);

export default CSSModules(BodyHistory, styles, { allowMultiple: true })
import React from 'react'

import './BodyHistory.scss'

const BodyHistory = ({ history }) => (
    <tbody>
        { history.map((item, index) => 
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

export default BodyHistory
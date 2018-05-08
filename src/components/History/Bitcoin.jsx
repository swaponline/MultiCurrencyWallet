import React from 'react'

import './History.scss'

const Bitcoin = ({ history }) => history !== undefined && history.map((item, index) => 
    <tr key={index}>
        <td>
            <div className="table__coin">
                <div className='table__coin-img table__coin-btc'></div>
                <div className="table__coin-abbr">BTC</div>
                <div className="table__coin-name">Bitcoin</div>
            </div>
        </td>

        <td>
            <div className="table__status">
                <div className={item.type === 'in' ? 'table__status-stat table__status-stat_received' : item.type === 'out' ? 'table__status-stat table__status-stat_sent' : 'table__status-stat '} >Sent</div>
                <div className="table__status-date">{JSON.stringify(item.date)}</div>
                <div className="table__status-address">Address: <span className="table__status-address-hash">{item.address}</span></div>
            </div>
        </td>

        <td>
            <span href="#" className={item.type === 'in' ? 'table__amount table__amount_received' : item.type === 'out' ? 'table__amount table__amount_sent' : 'table__amount '}>{item.value}</span>
        </td>
    </tr>
) 

export default Bitcoin
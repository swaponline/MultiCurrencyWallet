import React from 'react'

import './History.scss'
import Wallet from './Wallet'

const History = ({ transactions, fetching }) => (
    <tbody>
        {fetching ? transactions.map((item, index) => {
            return <Wallet 
                key={index} 
                direction={item.direction}
                date={item.date}
                value={Number(item.value)}
                address={item.address} 
                type={item.type}
            />
        }
            
        ) : <tr><td>Идет загрузка ....</td></tr> }
    </tbody>
)

export default History
import React from 'react'

import './History.scss'
import Wallet from './Wallet'

const History = ({ history }) => (
    <tbody>
        { history.map((item, index) => {
            return <Wallet 
                key={index} 
                direction={item.direction}
                date={item.date}
                value={Number(item.value)}
                address={item.address} 
                type={item.type}
            />
        }
            
        ) }
    </tbody>
)

export default History
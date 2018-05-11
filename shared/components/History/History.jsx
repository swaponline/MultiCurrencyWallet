import React from 'react'

import './History.scss'
import Wallet from './Wallet'

const History = ({ history }) => (
    <tbody>
        { history.map((item, index) => 
            <Wallet 
                key={index} 
                type={item.type}
                date={item.date}
                value={Number(item.value)}
                address={item.address} 
                icon='table__coin-eth' 
                currency='ETH' 
                name='Ethereum'
            />
        ) }
    </tbody>
)

export default History
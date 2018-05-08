import React from 'react'

import './History.scss'
import Wallet from './Wallet'

const History = ({ history }) => (
    <tbody>
        { history.map((item, index) => 
            <Wallet key={index} history={item} icon='table__coin-eth' currency='ETH' name='Ethereum'/>
        ) }
    </tbody>
)

export default History
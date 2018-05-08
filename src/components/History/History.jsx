import React from 'react'

import './History.scss'
import Ethereum from './Ethereum'
import Bitcoin from './Bitcoin'

const History = ({ wallets }) => (
    <tbody>
        <Bitcoin history={wallets[0].history} /> 
        <Ethereum history={wallets[1].history} />
    </tbody>
);

export default History
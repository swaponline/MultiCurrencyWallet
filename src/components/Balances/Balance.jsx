import React from 'react'

import './Balances.scss'
import Wallet from './Wallet'

const Balance = ({ wallets }) => (
    <tbody>
        { wallets.map((wallet, index) =>
            <Wallet key={index} wallet={wallet} />
        )}
    </tbody>
);

export default Balance
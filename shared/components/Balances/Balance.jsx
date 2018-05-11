import React from 'react'
import './Balances.scss'

import Wallet from './Wallet'

const Balance = ({ wallets }) => (
    <tbody>
        { wallets.map((wallet, index) =>
            <Wallet 
                key={ index }
                balance={ wallet.balance }
                currency={ wallet.currency }
                address={ wallet.address }  
            />
        )}
    </tbody>
);

export default Balance
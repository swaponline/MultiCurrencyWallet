import React from 'react'
import './Balances.scss'

import Wallet from './Wallet'

const Balance = ({ wallets, openModal }) => (
    <tbody>
        { wallets.map((wallet, index) =>
            <Wallet 
                key={ index }
                balance={ wallet.balance }
                currency={ wallet.currency }
                address={ wallet.address }
                openModal={() => openModal('CARD', true, { wallet })}  
            />
        )}
    </tbody>
);

export default Balance
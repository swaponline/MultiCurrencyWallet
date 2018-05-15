import React from 'react'
import './Balances.scss'

import Wallet from './Wallet'

const Balance = ({ wallets, openModal, fetching }) => (
    <tbody>
    { fetching  ? 
        wallets.map((wallet, index) =>
            <Wallet 
                key={ index }
                balance={ wallet.balance }
                currency={ wallet.currency }
                address={ wallet.address }
                openModal={() => openModal('CARD', true, { wallet })}  
            />
        ) : <tr><td>Идет загрузка данных...</td></tr>}
    </tbody>
);

export default Balance
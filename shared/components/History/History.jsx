import React from 'react'
import PropTypes from 'prop-types'
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

History.propTypes = {
    transactions: PropTypes.array.isRequired,
    fetching: PropTypes.bool.isRequired
}

export default History
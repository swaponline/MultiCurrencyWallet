import React from 'react'

import Title from './Title/Title'
import Input from './Input/Input'

const TradePanel = ({ name, currency, row, className }) => (
    <div className={className} >
        <Title name={name}/>
        <Input currency={currency} row={row} />
    </div>
)

export default TradePanel
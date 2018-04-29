import React from 'react'

import Title from './Title/Title'
import Input from './Input/Input'

const TradePanel = ({ name, icon, currency, row, ...rest }) => (
    <div {...rest } >
        <Title name={name}/>
        <Input 
            icon={icon} 
            currency={currency}
            row={row}
        />
    </div>
);

export default TradePanel
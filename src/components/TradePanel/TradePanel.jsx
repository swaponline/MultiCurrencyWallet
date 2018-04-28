import React from 'react'

import Title from './Title/Title'
import Input from './Input/Input'

const TradePanel = ({ name, icon, currency, ...rest }) => (
    <div {...rest } >
        <Title name={name}/>
        <Input 
            icon={icon} 
            currency={currency}
        />
    </div>
)

export default TradePanel
import React from 'react'

import Title from './Title/Title'
import Input from './Input/Input'

function TradePanel(props) {
    return(
        <div {...props} >

            <Title name={props.name}/>
            <Input 
                icon={props.icon} 
                currency={props.currency}
            />
            
        </div>
    )
}

export default TradePanel
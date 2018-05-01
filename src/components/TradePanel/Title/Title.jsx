import React from 'react'

import './Title.scss'

const Title = ({name}) => (
    <div className="trade-panel__title">
        <span>{name}</span>
        <span className="question" data-toggle="tooltip" data-placement="top"
        title="Enter the amount and the address. Transfer your coins and let the magic happen.">
        ?</span>
    </div>
)

export default Title
import React from 'react'

import './Button.scss'

const Button = ({ back }) => (
    <div className="confirm__buttons">
        <a href="#" className="confirm__back" onClick={ back }>Back</a>
        <a href="#" className="confirm__submit" >Confirm</a>
    </div>
)

export default Button


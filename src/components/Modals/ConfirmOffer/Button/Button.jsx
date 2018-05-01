import React from 'react'

import './Button.scss'

const Button = ({isBack}) => (
    <div className="confirm__buttons">
        <a href="#" className="confirm__back" onClick={isBack}>Back</a>
        <a href="#" className="confirm__submit" >Confirm</a>
    </div>
)

export default Button


import React from 'react'
import './Withdraw.scss'

const Withdraw = ({ text, isOpen, ...rest }) => (
    <a href="#" className="table__withdraw" {...rest} 
    onClick={ (event) => {
        event.preventDefault()
        console.log({...rest})
        return isOpen()
    }}>{text }</a>
)

export default Withdraw
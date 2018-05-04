import React from 'react'
import './Withdraw.scss'

const Withdraw = ({ text, ...rest }) => (
    <a href="#" className="table__withdraw" {...rest} >{text }</a>
)

export default Withdraw
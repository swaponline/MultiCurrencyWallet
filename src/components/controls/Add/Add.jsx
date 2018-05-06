import React from 'react'

import AddSvg from './add.svg'
import './add.scss'

const Add = ({ isOpen }) => (
    <a href="#" className="user-cont__add-user" onClick={ (event) => {
        event.preventDefault()
        return isOpen('OFFER')
    }}>
        <img src={AddSvg} alt=""/>
    </a>
)

export default Add
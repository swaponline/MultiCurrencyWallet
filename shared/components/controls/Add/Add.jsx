import React from 'react'
import PropTypes from 'prop-types'
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

Add.propTypes = {
    isOpen: PropTypes.func.isRequired
}

export default Add
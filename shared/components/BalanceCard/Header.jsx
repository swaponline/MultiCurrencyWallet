import React from 'react'

const Header = ({ currency, isClose }) => (
    <div className="modal-header">
        <h4 className="modal-title" >{ currency.toUpperCase() }</h4>
        <button type="button" className="close" onClick={ () => isClose() } >&times;</button>
    </div>
)

export default Header
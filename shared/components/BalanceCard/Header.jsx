import React from 'react'
import PropTypes from 'prop-types'

const Header = ({ currency, isClose }) => (
    <div className="modal-header">
        <h4 className="modal-title" >{ currency.toUpperCase() }</h4>
        <button type="button" className="close" onClick={ () => isClose() } >&times;</button>
    </div>
)

Footer.propTypes = {
    isClose: PropTypes.func.isRequired,
    currency:  PropTypes.string.isRequired
}

export default Header
import React from 'react'
import PropTypes from 'prop-types'
import actions from 'redux/actions'

export default function Header({ currency }) {
  return (
    <div className="modal-header">
      <h4 className="modal-title" >{ currency.toUpperCase() }</h4>
      <button type="button" className="close" onClick={actions.modals.close} >&times;</button>
    </div>
  )
}

Header.propTypes = {
  currency:  PropTypes.string.isRequired,
}


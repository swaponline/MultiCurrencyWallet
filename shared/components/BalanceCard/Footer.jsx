import React from 'react'
import PropTypes from 'prop-types'
import actions from 'redux/actions'


export default function Footer({ withdraw, address, amount, currency }) {
  return (
    <div className="modal-footer">
      <button type="button" onClick={actions.modals.close}className="btn btn-secondary" >Close</button>
      <button
        type="submit"
        onClick={event => {
          event.preventDefault()
          withdraw(address, amount, currency.toUpperCase())
        }}
        className="btn btn-primary">Transfer
      </button>
    </div>
  )
}

Footer.propTypes = {
  withdraw: PropTypes.func.isRequired,
  address: PropTypes.string.isRequired,
  currency:  PropTypes.string.isRequired,
  amount:  PropTypes.number.isRequired,
}


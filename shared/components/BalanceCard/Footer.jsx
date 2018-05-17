import React from 'react'
import PropTypes from 'prop-types'

const Footer = ({ isClose, withdraw, address, amount, currency }) => (
  <div className="modal-footer">
    <button type="button" onClick={() => isClose()}className="btn btn-secondary" >Close</button>
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

Footer.propTypes = {
  isClose: PropTypes.func.isRequired,
  withdraw: PropTypes.func.isRequired,
  address: PropTypes.string.isRequired,
  currency:  PropTypes.string.isRequired,
  amount:  PropTypes.number.isRequired,
}

export default Footer

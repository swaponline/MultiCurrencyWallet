import React from 'react'
import PropTypes from 'prop-types'
import './Withdraw.scss'

const Withdraw = ({ text, isOpen }) => (
  <a
    href="#"
    className="table__withdraw"
    onClick={(event) => {
      event.preventDefault()
      return isOpen()
    }}>{text }
  </a>
)

Withdraw.propTypes = {
  text: PropTypes.string.isRequired,
  isOpen: PropTypes.func.isRequired,
}

export default Withdraw

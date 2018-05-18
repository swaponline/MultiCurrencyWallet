import React from 'react'
import PropTypes from 'prop-types'
import './Withdraw.scss'

export default function Withdraw({ text, isOpen }) {
  return (
    <a
      href="#"
      className="table__withdraw"
      onClick={(event) => {
        event.preventDefault()
        return isOpen()
      }}
    >
      {text}
    </a>
  )
}

Withdraw.propTypes = {
  text: PropTypes.string.isRequired,
  isOpen: PropTypes.func.isRequired,
}


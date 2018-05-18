import React from 'react'
import PropTypes from 'prop-types'

export default function Button({ className, text }) {
  return <a href="#" className={className} >{text}</a>
}

Button.propTypes = {
  className: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
}


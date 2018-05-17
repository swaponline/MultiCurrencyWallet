import React from 'react'
import PropTypes from 'prop-types'
import './Button.scss'

const Button = ({ back }) => (
  <div className="confirm__buttons">
    <a href="#" className="confirm__back" onClick={back}>Back</a>
    <a href="#" className="confirm__submit" >Confirm</a>
  </div>
)

Button.propTypes = {
  back: PropTypes.func.isRequired,
}

export default Button


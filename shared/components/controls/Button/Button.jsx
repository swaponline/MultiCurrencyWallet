import React from 'react'
import PropTypes from 'prop-types'

const Button = ({ className, text }) => {
    return <a href="#" className={ className } >{ text }</a>
}

Button.propTypes = {
    className: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
}

export default Button
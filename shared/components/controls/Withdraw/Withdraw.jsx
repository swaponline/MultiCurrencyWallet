import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Withdraw.scss'


function Withdraw({ text, isOpen }) {
  return (
    <a
      href="#"
      styleName="table__withdraw"
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

export default CSSModules(Withdraw, styles)

import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './ButtonEnter.scss'


const ButtonEnter = ({ className, onClick, children }) => (
  <button styleName="buttonCreate" className={className} onClick={onClick} >
    {children}
  </button>
)

ButtonEnter.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired,
}

export default CSSModules(ButtonEnter, styles)

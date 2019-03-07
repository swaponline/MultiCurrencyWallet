import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './ButtonCreate.scss'


const ButtonCreate = ({ className, onClick, children }) => (
  <button styleName="buttenCreate" className={className} onClick={onClick}>
    {children}
  </button>
)

ButtonCreate.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired,
}

export default CSSModules(ButtonCreate, styles)

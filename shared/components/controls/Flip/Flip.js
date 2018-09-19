import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Flip.scss'


const Flip = ({ onClick }) => (
  <button alt="flip currency" onClick={onClick} styleName="trade-panel__change" />
)

Flip.propTypes = {
  onClick: PropTypes.func.isRequired,
}


export default CSSModules(Flip, styles)

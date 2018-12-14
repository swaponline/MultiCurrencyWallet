import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Flip.scss'


const Flip = ({ onClick, className }) => (
  <button alt="flip currency" onClick={onClick} className={className} styleName="trade-panel__change" />
)

Flip.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
}

Flip.defaulProps = {
  className: '',
}


export default CSSModules(Flip, styles)

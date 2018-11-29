import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Switching.scss'

import PropTypes from 'prop-types'


const Switching = ({ onClick }) => (
  <button onClick={onClick} styleName="Switching" />
)

Switching.propTypes = {
  onClick: PropTypes.func.isRequired,
}

export default CSSModules(Switching, styles)

import React from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './Overlay.scss'


const Overlay = ({ children, onClick }) => (
  <div styleName="overlay" onClick={onClick}>
    {children}
  </div>
)

Overlay.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
}

export default cssModules(Overlay, styles)

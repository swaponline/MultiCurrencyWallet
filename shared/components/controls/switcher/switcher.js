import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './switcher.scss'
import PropTypes from 'prop-types'


const Switcher = ({ onClick }) => (
  <button onClick={onClick} styleName="Switcher" />
)
Switcher.propTypes = {
  onClick: PropTypes.func.isRequired,
}


export default CSSModules(Switcher, styles)

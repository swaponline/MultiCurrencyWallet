import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './RemoveButton.scss'


const RemoveButton = ({ className, onClick }) => (
  <button styleName="removeButton" className={className} onClick={onClick} />
)

RemoveButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired,
}

export default CSSModules(RemoveButton, styles)

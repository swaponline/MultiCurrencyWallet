import React from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './ButtonsInRow.scss'


const ButtonsInRow = ({ children, ...rest }) => (
  <div {...rest}>
    <div styleName="twoButtonsInRow">
      {children}
    </div>
  </div>
)

ButtonsInRow.propTypes = {
  children: PropTypes.node.isRequired,
}

export default cssModules(ButtonsInRow, styles)

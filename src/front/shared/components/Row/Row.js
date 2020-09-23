import React from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './Row.scss'


const Row = ({ children, className }) => (
  <div className={className}>
    <div styleName="row" >
      {children}
    </div>
  </div>
)

Row.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

export default cssModules(Row, styles)

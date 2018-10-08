import React from 'react'
import PropTypes from 'prop-types'

import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './FieldLabel.scss'


const FieldLabel = ({ children, inRow }) => (
  <div styleName={cx('label', { 'inRow': inRow })} >{children}</div>
)

FieldLabel.propTypes = {
  children: PropTypes.element.isRequired,
  inRow: PropTypes.bool,
}


export default cssModules(FieldLabel, styles, { allowMultiple: true })

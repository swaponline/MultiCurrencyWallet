import React from 'react'
import PropTypes from 'prop-types'

import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './FieldLabel.scss'


const FieldLabel = ({ children, inRow, inDropDown }) => (
  <div styleName={cx('label', { 'inRow': inRow }, { 'inDropDown': inDropDown })} >{children}</div>
)

FieldLabel.propTypes = {
  inRow: PropTypes.bool,
}


export default cssModules(FieldLabel, styles, { allowMultiple: true })

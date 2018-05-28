import React from 'react'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './FieldLabel.scss'


const FieldLabel = ({ children, inRow }) => (
  <div styleName={cx('label', { 'inRow': inRow })}>{children}</div>
)

export default cssModules(FieldLabel, styles, { allowMultiple: true })

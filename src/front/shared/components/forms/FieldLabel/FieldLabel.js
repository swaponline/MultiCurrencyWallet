import React from 'react'
import PropTypes from 'prop-types'
import { constants } from 'helpers'

import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './FieldLabel.scss'


const isDark = localStorage.getItem(constants.localStorage.isDark)

const FieldLabel = ({ children, inRow, inDropDown, positionStatic }) => (
  <div styleName={cx('label', { 'inRow': inRow }, { 'inDropDown': inDropDown }, { 'positionStatic': positionStatic }, { '--dark': isDark })} >{children}</div>
)

FieldLabel.propTypes = {
  inRow: PropTypes.bool,
}


export default cssModules(FieldLabel, styles, { allowMultiple: true })

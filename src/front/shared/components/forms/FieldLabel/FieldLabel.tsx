import React from 'react'
import { constants } from 'helpers'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './FieldLabel.scss'

const isDark = localStorage.getItem(constants.localStorage.isDark)

interface FieldLabelProps {
  children: React.ReactNode
  inRow?: boolean
  inDropDown?: boolean
  positionStatic?: boolean
}

const FieldLabel = ({ children, inRow, inDropDown, positionStatic }: FieldLabelProps) => (
  <div
    styleName={cx(
      'label',
      { inRow: inRow },
      { inDropDown: inDropDown },
      { positionStatic: positionStatic },
      { '--dark': isDark }
    )}
  >
    {children}
  </div>
)

export default cssModules(FieldLabel, styles, { allowMultiple: true })

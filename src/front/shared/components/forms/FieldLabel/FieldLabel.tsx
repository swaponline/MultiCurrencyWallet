import React from 'react'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './FieldLabel.scss'

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
    )}
  >
    {children}
  </div>
)

export default cssModules(FieldLabel, styles, { allowMultiple: true })

import React from 'react'

import cssModules from 'react-css-modules'
import styles from './RequestButton.scss'


const RequestButton = ({ onClick, disabled }) =>  (
  <button styleName={!disabled ? 'button disabled' : 'button'} disabled={!disabled} onClick={onClick} />
)

export default cssModules(RequestButton, styles, { allowMultiple: true })

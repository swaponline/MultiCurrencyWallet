import React from 'react'

import cssModules from 'react-css-modules'
import styles from './RequestButton.scss'


const RequestButton = ({ onClick }) =>  (
  <div styleName="button" onClick={onClick} />
)

export default cssModules(RequestButton, styles, { allowMultiple: true })

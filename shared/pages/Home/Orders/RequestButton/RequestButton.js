import React from 'react'

import cssModules from 'react-css-modules'
import styles from './RequestButton.scss'


const RequestButton = ({ sendRequest }) =>  (
  <div styleName="button" onClick={sendRequest} />
)

export default cssModules(RequestButton, styles, { allowMultiple: true })

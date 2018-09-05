import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Question.scss'


const Question = () => (
  <span styleName="question" onClick={() => { window.openSwapHelp() }}>?</span>
)

export default CSSModules(Question, styles)

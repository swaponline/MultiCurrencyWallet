import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Question.scss'


const Question = () => (
  <a href="https://wiki.swap.online/faq" target="_blank" rel="noreferrer noopener" styleName="question">?</a>
)

export default CSSModules(Question, styles)

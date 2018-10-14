import React, { Fragment } from 'react'

import CSSModules from 'react-css-modules'
import styles from './Question.scss'
import ReactTooltip from 'react-tooltip'

const Question = () => (
  <Fragment>
    <a href="https://wiki.swap.online/faq" target="_blank" rel="noreferrer noopener" styleName="question" data-tip data-for="q">?</a>
      <ReactTooltip id="q" type="light" effect="solid">
        <span>Know more about us</span>
      </ReactTooltip>
  </Fragment>
)

export default CSSModules(Question, styles)

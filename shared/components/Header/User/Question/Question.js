import React, { Fragment } from 'react'

import CSSModules from 'react-css-modules'
import styles from './Question.scss'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'


const Question = () => (
  <Fragment>
    <a href="https://wiki.swap.online/faq" target="_blank" rel="noreferrer noopener" styleName="question" data-tip data-for="Knowmore">
      <FormattedMessage id="QUESTION11" defaultMessage="?" />
    </a>
    <ReactTooltip id="Knowmore" type="light" effect="solid">
      <span>
        <FormattedMessage id="QUESTION15" defaultMessage="Know more about us" />
      </span>
    </ReactTooltip>
  </Fragment>
)

export default CSSModules(Question, styles)

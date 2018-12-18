import React, { Fragment } from 'react'

import CSSModules from 'react-css-modules'
import styles from './Question.scss'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'


const Question = ({ openTour }) => (
  <Fragment>
    <span onClick={openTour} styleName="question" data-tip data-for="Knowmore"><FormattedMessage id="question12" defaultMessage="?" /></span>
    <ReactTooltip id="Knowmore" type="light" effect="solid">
      <span>
        <FormattedMessage id="question15" defaultMessage="Know more about us" />
      </span>
    </ReactTooltip>
  </Fragment>
)

export default CSSModules(Question, styles)

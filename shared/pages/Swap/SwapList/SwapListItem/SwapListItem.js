import React from 'react'

import { isMobile } from 'react-device-detect'

import CSSModules from 'react-css-modules'
import styles from './SwapListItem.scss'

import { FormattedMessage } from 'react-intl'

const StepListItem = ({ flow, listItem, swap }) => (
  <div style={{ paddingTop: isMobile ? listItem.padding : '' }} styleName={((flow.step >= listItem.start && flow.step < listItem.stop) && 'stepItem active') || (flow.step < listItem.stop && 'stepItem') || 'stepItem active checked'}>
    <span styleName="stepNumber">{flow.step < listItem.stop ? listItem.current : <i className="fas fa-check" />}</span>
    <p styleName="stepText">
      {listItem.text} {console.log(swap.flow.stepNumbers)}
    </p>
  </div>
)

export default CSSModules(StepListItem, styles, { allowMultiple: true })

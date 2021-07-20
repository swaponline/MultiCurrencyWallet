import React from 'react'

import { FormattedMessage } from 'react-intl'

import CSSModules from 'react-css-modules'

import styles from './styles.scss'


const Tooltip = (props) => {
  const { continuous, index, isLastStep, step, backProps, primaryProps, skipProps, tooltipProps, closeTour } = props

  const click = e => {
    skipProps.onClick(e)
    closeTour()
  }

  const clickPrimary = (e) => {
    primaryProps.onClick(e)
    if (isLastStep) {
      closeTour()
    }
  }

  return (
    <div styleName="toolTipBody" {...tooltipProps}>
      {step.title && <h2 styleName="TooltipTitle">{step.title}</h2>}
      {step.content && <div styleName="TooltipContent">{step.content}</div>}
      <div styleName="TooltipFooter">
        {!isLastStep && (
          <button {...skipProps} onClick={click}>
            <FormattedMessage id="skip" defaultMessage="Skip" />
          </button>
        )}
        {index > 0 && (
          <button {...backProps}>
            <FormattedMessage id="back" defaultMessage="Back" />
          </button>
        )}
        <button {...primaryProps} onClick={clickPrimary}>
          {continuous && !isLastStep ?
            <FormattedMessage id="nextTourWindow" defaultMessage="Next" />
            :
            <FormattedMessage id="closeTourWindow" defaultMessage="Close" />}
        </button>
      </div>
    </div>
  )
}

export default CSSModules(Tooltip, styles, { allowMultiple: true })

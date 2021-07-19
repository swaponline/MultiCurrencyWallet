import React from 'react'
import cssModules from 'react-css-modules'
import styles from './RequestButton.scss'
import PAIR_TYPES from 'helpers/constants/PAIR_TYPES'
import { FormattedMessage } from 'react-intl'

const RequestButton = (params) => {
  const {
    disabled,
    onClick,
    data: {
      type,
      base,
      main,
    },
  } = params

  return (
    <button styleName={`button ${disabled ? 'disabled' : ''}`} onClick={onClick}>
      <div styleName="rows">
        <div styleName="row1">
          <FormattedMessage id="Reqstbttn16" defaultMessage="Buy" />
          {' '}
          <span styleName="ticker">{type === PAIR_TYPES.BID ? base : main}</span>
        </div>
        <div  styleName="row2">
          <FormattedMessage id="Reqstbttn22" defaultMessage="for" />
          {' '}
          <span styleName="ticker">{type === PAIR_TYPES.BID ? main : base}</span>
        </div>
      </div>
    </button>
  )
}

export default cssModules(RequestButton, styles, { allowMultiple: true })

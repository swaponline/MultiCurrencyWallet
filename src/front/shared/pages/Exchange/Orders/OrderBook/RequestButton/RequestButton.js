import React, { Fragment } from 'react'

import cssModules from 'react-css-modules'
import styles from './RequestButton.scss'
import { isMobile } from 'react-device-detect'

import PAIR_TYPES from 'helpers/constants/PAIR_TYPES'

import { FormattedMessage } from 'react-intl'


const RequestButton = ({ disabled, children, data: { type, base, amount, total, main }, ...rest  }) =>  (
  <button styleName={disabled ? 'button disabled' : 'button'} {...rest}>
    <div styleName="rows">
      <div styleName="row1">
        <FormattedMessage id="Reqstbttn16" defaultMessage="Buy" />
        {' '}
        {/*{amount.toFixed(5)}{' '}{}*/}
        <span styleName="ticker">{type === PAIR_TYPES.BID ? base : main}</span>
      </div>
      <div  styleName="row2">
        <FormattedMessage id="Reqstbttn22" defaultMessage="for" />
        {' '}
        {/*{total.toFixed(5)}{' '}*/}
        <span styleName="ticker">{type === PAIR_TYPES.BID ? main : base}</span>
      </div>
      {/*<FormattedMessage id="RowM166" defaultMessage="Start" />*/}
    </div>
  </button>
)

export default cssModules(RequestButton, styles, { allowMultiple: true })
